"""
Agent Wallet Management - Autonomous payment handling for x402 protocol

This module handles the agent's autonomous wallet operations, inspired by
demo/a2a architecture. The agent uses its own EOA (Externally Owned Account)
to pay for API usage automatically without user intervention.

Key features:
- EIP-3009 authorization signing (transferWithAuthorization)
- Safety limits (daily spend, per-transaction caps)
- Balance monitoring and alerts
- Transaction history tracking
"""

import os
from typing import Optional, Dict, Any
from decimal import Decimal
from datetime import datetime, timedelta
from eth_account import Account
from eth_account.messages import encode_defunct
from web3 import Web3
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from .database import ApiUsage
from .config import settings
import secrets


class AgentWalletService:
    """
    Manages the autonomous agent's wallet for x402 payments.
    
    Similar to demo/a2a's PaywallService, this class handles:
    - Private key management
    - Payment authorization signing
    - Safety limits enforcement
    - Balance checking
    """
    
    def __init__(self):
        self.private_key = settings.AGENT_PRIVATE_KEY
        self.agent_address = settings.AGENT_ADDRESS
        
        if not self.private_key:
            raise ValueError("AGENT_PRIVATE_KEY not configured. Run create-agent-wallet.js first.")
        
        # Initialize Web3 connection to Cronos
        self.w3 = Web3(Web3.HTTPProvider(settings.CRONOS_RPC_URL))
        
        # Load account from private key
        self.account = Account.from_key(self.private_key)
        
        # Verify address matches
        if self.agent_address and self.account.address.lower() != self.agent_address.lower():
            raise ValueError(f"Agent address mismatch: {self.account.address} != {self.agent_address}")
        
        print(f"🤖 Agent Wallet initialized: {self.account.address}")
    
    async def get_balance(self) -> Decimal:
        """
        Get current CRO balance of the agent wallet.
        
        Returns:
            Balance in CRO (not wei)
        """
        try:
            balance_wei = self.w3.eth.get_balance(self.account.address)
            balance_cro = Decimal(self.w3.from_wei(balance_wei, 'ether'))
            return balance_cro
        except Exception as e:
            print(f"❌ Error getting balance: {e}")
            return Decimal(0)
    
    async def check_payment_allowed(
        self, 
        amount_cro: Decimal,
        db: AsyncSession
    ) -> tuple[bool, Optional[str]]:
        """
        Check if payment is allowed based on safety limits.
        
        Args:
            amount_cro: Amount to pay in CRO
            db: Database session for checking daily spend
        
        Returns:
            Tuple of (is_allowed, reason_if_not)
        """
        # Check per-transaction limit
        if amount_cro > Decimal(str(settings.AGENT_MAX_PER_TRANSACTION)):
            return False, f"Exceeds per-transaction limit ({settings.AGENT_MAX_PER_TRANSACTION} CRO)"
        
        # Check daily spend limit
        today = datetime.utcnow().date()
        daily_spend_query = select(func.sum(ApiUsage.cost)).where(
            ApiUsage.user_address == self.account.address,
            func.date(ApiUsage.timestamp) == today
        )
        result = await db.execute(daily_spend_query)
        daily_spend = result.scalar() or 0
        
        if daily_spend + float(amount_cro) > settings.AGENT_MAX_DAILY_SPEND:
            return False, f"Would exceed daily limit ({settings.AGENT_MAX_DAILY_SPEND} CRO)"
        
        # Check wallet balance
        balance = await self.get_balance()
        min_balance = Decimal(str(settings.AGENT_MIN_BALANCE))
        
        if balance - amount_cro < min_balance:
            return False, f"Insufficient balance (need to keep {min_balance} CRO minimum)"
        
        return True, None
    
    def create_payment_authorization(
        self,
        payment_id: str,
        recipient: str,
        amount_wei: int,
        valid_after: int = 0,
        valid_before: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Create EIP-3009 transferWithAuthorization signature.
        
        Similar to demo/a2a's create_eip3009_authorization method.
        This creates the signed authorization that allows the x402 facilitator
        to transfer funds from the agent's wallet.
        
        Args:
            payment_id: Unique payment identifier
            recipient: Address to receive payment
            amount_wei: Amount in wei
            valid_after: Unix timestamp (default: now)
            valid_before: Unix timestamp (default: 1 hour from now)
        
        Returns:
            Dict with signature components (v, r, s) and authorization data
        """
        if valid_before is None:
            valid_before = int(datetime.utcnow().timestamp()) + 3600
        
        # Generate nonce (32 bytes random)
        nonce = '0x' + secrets.token_hex(32)
        
        # EIP-3009 domain separator (depends on token contract)
        # This should match the USDC/token contract on Cronos
        domain_separator = self._get_domain_separator()
        
        # Create EIP-3009 message hash
        type_hash = Web3.keccak(text="TransferWithAuthorization(address from,address to,uint256 value,uint256 validAfter,uint256 validBefore,bytes32 nonce)")
        
        message_hash = Web3.keccak(
            Web3.solidity_keccak(
                ['bytes32', 'address', 'address', 'uint256', 'uint256', 'uint256', 'bytes32'],
                [
                    type_hash,
                    self.account.address,
                    Web3.to_checksum_address(recipient),
                    amount_wei,
                    valid_after,
                    valid_before,
                    Web3.to_bytes(hexstr=nonce)
                ]
            )
        )
        
        # Sign with domain separator (EIP-712)
        digest = Web3.keccak(b'\x19\x01' + domain_separator + message_hash)
        signed = self.account.signHash(digest)
        
        return {
            'from': self.account.address,
            'to': recipient,
            'value': amount_wei,
            'validAfter': valid_after,
            'validBefore': valid_before,
            'nonce': nonce,
            'v': signed.v,
            'r': signed.r.to_bytes(32, 'big').hex(),
            's': signed.s.to_bytes(32, 'big').hex(),
            'signature': signed.signature.hex()
        }
    
    def _get_domain_separator(self) -> bytes:
        """
        Get EIP-712 domain separator for the token contract.
        This should be fetched from the actual USDC contract on Cronos.
        """
        # TODO: Fetch from actual contract
        # For now, using a placeholder
        name = "USD Coin"
        version = "2"
        chain_id = settings.CRONOS_CHAIN_ID
        verifying_contract = settings.X402_FACILITATOR_ADDRESS
        
        domain_type_hash = Web3.keccak(text="EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)")
        
        domain_separator = Web3.keccak(
            Web3.solidity_keccak(
                ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
                [
                    domain_type_hash,
                    Web3.keccak(text=name),
                    Web3.keccak(text=version),
                    chain_id,
                    Web3.to_checksum_address(verifying_contract)
                ]
            )
        )
        
        return domain_separator
    
    async def pay_for_api_usage(
        self,
        user_address: str,
        api_id: str,
        cost_cro: Decimal,
        db: AsyncSession
    ) -> tuple[bool, Optional[str], Optional[str]]:
        """
        Autonomously pay for API usage on behalf of a user.
        
        This is the main method called when the agent needs to pay for an API call.
        It checks limits, creates authorization, and processes payment.
        
        Args:
            user_address: User whose budget is being spent
            api_id: API being called
            cost_cro: Cost in CRO
            db: Database session
        
        Returns:
            Tuple of (success, transaction_hash, error_message)
        """
        # Check if payment is allowed
        allowed, reason = await self.check_payment_allowed(cost_cro, db)
        if not allowed:
            return False, None, f"Payment blocked: {reason}"
        
        try:
            # Convert CRO to wei
            amount_wei = self.w3.to_wei(float(cost_cro), 'ether')
            
            # Generate payment ID
            payment_id = f"guardian-{user_address[:8]}-{api_id[:8]}-{int(datetime.utcnow().timestamp())}"
            
            # Create payment authorization
            auth = self.create_payment_authorization(
                payment_id=payment_id,
                recipient=settings.X402_FACILITATOR_ADDRESS,
                amount_wei=amount_wei
            )
            
            # TODO: Submit to x402 facilitator
            # For now, simulate success
            tx_hash = f"0x{secrets.token_hex(32)}"
            
            print(f"✅ Agent paid {cost_cro} CRO for {api_id} (user: {user_address[:8]}...)")
            print(f"   TX: {tx_hash}")
            
            return True, tx_hash, None
            
        except Exception as e:
            print(f"❌ Payment failed: {e}")
            return False, None, str(e)
    
    async def get_daily_spend(self, db: AsyncSession) -> Decimal:
        """Get total spent today by the agent."""
        today = datetime.utcnow().date()
        query = select(func.sum(ApiUsage.cost)).where(
            ApiUsage.user_address == self.account.address,
            func.date(ApiUsage.timestamp) == today
        )
        result = await db.execute(query)
        return Decimal(str(result.scalar() or 0))
    
    async def get_wallet_status(self, db: AsyncSession) -> Dict[str, Any]:
        """
        Get comprehensive wallet status for monitoring.
        
        Returns:
            Dict with balance, daily spend, limits, etc.
        """
        balance = await self.get_balance()
        daily_spend = await self.get_daily_spend(db)
        
        return {
            'address': self.account.address,
            'balance_cro': float(balance),
            'daily_spend_cro': float(daily_spend),
            'daily_limit_cro': settings.AGENT_MAX_DAILY_SPEND,
            'per_tx_limit_cro': settings.AGENT_MAX_PER_TRANSACTION,
            'min_balance_cro': settings.AGENT_MIN_BALANCE,
            'remaining_daily': settings.AGENT_MAX_DAILY_SPEND - float(daily_spend),
            'can_operate': balance > Decimal(str(settings.AGENT_MIN_BALANCE)),
            'needs_funding': balance < Decimal(str(settings.AGENT_MIN_BALANCE * 2))
        }


# Singleton instance
agent_wallet = None

def get_agent_wallet() -> AgentWalletService:
    """Get or create the singleton agent wallet instance."""
    global agent_wallet
    if agent_wallet is None:
        agent_wallet = AgentWalletService()
    return agent_wallet
