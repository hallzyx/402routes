"""
Configuration settings for AI Budget Guardian.
"""

from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Backend API
    BACKEND_URL: str = "http://localhost:8787"
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./guardian.db"
    
    # OpenAI
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4-turbo-preview"
    
    # Deepseek
    DEEPSEEK_API_KEY: Optional[str] = None
    DEEPSEEK_BASE_URL: str = "https://api.deepseek.com/v1"
    DEEPSEEK_MODEL: str = "deepseek-chat"
    
    # AI Provider (openai or deepseek)
    AI_PROVIDER: str = "openai"
    
    # Cronos/Web3
    CRONOS_RPC_URL: str = "https://evm-t3.cronos.org"
    CRONOS_CHAIN_ID: int = 25
    PRIVATE_KEY: Optional[str] = None
    GUARDIAN_WALLET_ADDRESS: Optional[str] = None
    
    # 🤖 Agent Wallet Configuration (for autonomous payments)
    # This wallet is used by the agent to pay for API usage automatically
    AGENT_PRIVATE_KEY: str = ""
    AGENT_ADDRESS: str = ""
    
    # Agent Payment Limits (safety mechanisms)
    AGENT_MAX_DAILY_SPEND: float = 10.0      # Maximum CRO per day
    AGENT_MAX_PER_TRANSACTION: float = 1.0   # Maximum CRO per transaction
    AGENT_MIN_BALANCE: float = 1.0           # Minimum CRO to keep in wallet
    
    # X402 Protocol
    X402_FACILITATOR_ADDRESS: str = "0x0000000000000000000000000000000000000000"  # TODO: Update
    
    # Budget Guardian Settings
    DEFAULT_BUDGET_LIMIT: float = 100.0
    WARNING_THRESHOLD: float = 0.8  # 80%
    CRITICAL_THRESHOLD: float = 0.95  # 95%
    PAUSE_THRESHOLD: float = 1.0  # 100%
    
    # Analysis Settings
    UNUSUAL_PATTERN_MULTIPLIER: float = 3.0  # 3x normal rate
    ANALYSIS_WINDOW_MINUTES: int = 5
    
    # Notification Settings
    ENABLE_EMAIL_NOTIFICATIONS: bool = False
    ENABLE_WEBHOOK_NOTIFICATIONS: bool = True
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
