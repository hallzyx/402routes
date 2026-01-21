#!/usr/bin/env node

/**
 * Create Agent Wallet - Generate a new Ethereum wallet for autonomous agent payments
 * 
 * This script creates a new EOA (Externally Owned Account) that will be used
 * by the AI Budget Guardian agent to autonomously pay for API usage via x402 protocol.
 * 
 * Usage:
 *   node create-agent-wallet.js
 * 
 * Security:
 *   - Store the private key ONLY in .env files
 *   - Add .env to .gitignore
 *   - Never commit or share the private key
 *   - Use different wallets for dev/staging/production
 */

const { Wallet } = require('ethers');
const fs = require('fs');
const path = require('path');

console.log('\n🤖 AI Budget Guardian - Agent Wallet Generator');
console.log('═══════════════════════════════════════════════\n');

// Generate new random wallet
const wallet = Wallet.createRandom();

console.log('✅ Nueva Wallet del Agente Creada:\n');
console.log('📍 Address (dirección pública):');
console.log(`   ${wallet.address}\n`);
console.log('🔑 Private Key (clave privada):');
console.log(`   ${wallet.privateKey}\n`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Display mnemonic for backup
console.log('💾 Mnemonic (frase de recuperación):');
console.log(`   ${wallet.mnemonic.phrase}\n`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Security warnings
console.log('⚠️  SEGURIDAD CRÍTICA:');
console.log('   • Guarda la private key SOLO en archivos .env');
console.log('   • NUNCA hagas commit de la private key');
console.log('   • Usa wallets diferentes para dev/staging/production');
console.log('   • Fondea con cantidades pequeñas al inicio\n');

// Instructions
console.log('📝 Siguientes pasos:\n');
console.log('1. Copia la private key a tu archivo .env:');
console.log(`   echo "AGENT_PRIVATE_KEY=${wallet.privateKey}" >> agent/.env\n`);
console.log('2. Copia también la address (opcional, para logs):');
console.log(`   echo "AGENT_ADDRESS=${wallet.address}" >> agent/.env\n`);
console.log('3. Fondea la wallet con CRO:');
console.log('   • Testnet: https://cronos.org/faucet');
console.log('   • Mainnet: Envía CRO desde tu wallet personal\n');
console.log('4. Verifica el balance en:');
console.log(`   https://cronoscan.com/address/${wallet.address}\n`);

// Create .env.example with agent wallet configuration
const envExamplePath = path.join(__dirname, '402routes', 'agent', '.env.example');
const envContent = `# AI Budget Guardian Agent Configuration
# Generated: ${new Date().toISOString()}

# AI Provider (choose: openai or deepseek)
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-openai-api-key-here
DEEPSEEK_API_KEY=your-deepseek-api-key-here

# Database
DATABASE_URL=sqlite+aiosqlite:///./guardian.db

# Budget Configuration
DEFAULT_MONTHLY_LIMIT=100.0
WARNING_THRESHOLD=0.80
PAUSE_THRESHOLD=1.00

# 🤖 Agent Wallet Configuration (for autonomous payments)
# This wallet is used by the agent to pay for API usage automatically
AGENT_PRIVATE_KEY=${wallet.privateKey}
AGENT_ADDRESS=${wallet.address}

# Agent Payment Limits (safety mechanisms)
AGENT_MAX_DAILY_SPEND=10.0      # Maximum CRO per day
AGENT_MAX_PER_TRANSACTION=1.0   # Maximum CRO per transaction
AGENT_MIN_BALANCE=1.0            # Minimum CRO to keep in wallet

# Cronos Network Configuration
CRONOS_RPC_URL=https://evm.cronos.org
CRONOS_CHAIN_ID=25
X402_FACILITATOR_ADDRESS=0x... # Will be configured

# Server
PORT=8000
`;

try {
  if (fs.existsSync(path.dirname(envExamplePath))) {
    fs.writeFileSync(envExamplePath, envContent);
    console.log(`✅ Archivo .env.example actualizado en: agent/.env.example\n`);
  }
} catch (error) {
  console.log(`ℹ️  No se pudo actualizar .env.example automáticamente`);
  console.log(`   Copia manualmente la configuración a tu archivo .env\n`);
}

// Save wallet info to a JSON file (for backup purposes only)
const walletInfo = {
  address: wallet.address,
  privateKey: wallet.privateKey,
  mnemonic: wallet.mnemonic.phrase,
  createdAt: new Date().toISOString(),
  purpose: 'AI Budget Guardian Agent - Autonomous Payments',
  network: 'Cronos (CRO)',
  warning: 'KEEP THIS FILE SECURE - Contains private key'
};

const backupPath = path.join(__dirname, `agent-wallet-${Date.now()}.json`);
fs.writeFileSync(backupPath, JSON.stringify(walletInfo, null, 2));

console.log(`💾 Backup guardado en: ${path.basename(backupPath)}`);
console.log('   ⚠️  NO SUBAS ESTE ARCHIVO A GIT\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('🎉 ¡Wallet del agente creada exitosamente!\n');
console.log('Para probar los pagos automáticos:');
console.log('   cd agent && python main.py\n');
