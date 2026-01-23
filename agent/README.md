# AI Budget Guardian

## Prerequisites

- Python 3.10 or higher
- pip package manager
- OpenAI API key OR DeepSeek API key
- Cronos Testnet RPC access
- Test CRO in agent wallet for autonomous payments

## Installation

1. Navigate to agent directory:
```bash
cd agent
```

2. Create and activate virtual environment (recommended):
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -e .
```

4. Configure environment variables:
```bash
cp .env.example .env
```

5. Edit `.env` file with your API keys:
```bash
# AI Provider (choose one)
AI_PROVIDER=openai  # or 'deepseek'
OPENAI_API_KEY=your_key_here
# OR
DEEPSEEK_API_KEY=your_key_here

# Blockchain
CRONOS_RPC_URL=https://evm-t3.cronos.org
AGENT_PRIVATE_KEY=your_wallet_private_key
```

6. Start the agent:
```bash
python main.py
```

The agent will start on `http://localhost:8000`.
OPENAI_API_KEY=sk-...
# DEEPSEEK_API_KEY=...  # Alternative to OpenAI

# Agent Wallet (auto-generated, do not modify)
AGENT_PRIVATE_KEY=0x...
AGENT_ADDRESS=0x...

# Network Configuration
NETWORK=cronos-testnet
RPC_URL=https://evm-t3.cronos.org

# API Configuration
PORT=8000
HOST=0.0.0.0
```

## Running the Agent

Development mode:
```bash
python main.py
```

With auto-reload (using uvicorn):
```bash
uvicorn app.main:app --reload --port 8000
```

The agent API will start on `http://localhost:8000`.

On startup, you'll see:
```
Agent Wallet initialized: 0x1f24eF014de80617470B2c4470FFB14CA4c20825
AI Budget Guardian started
AI Provider: openai
Server running on http://localhost:8000
```

## Agent Wallet Setup

### 1. Wallet Creation
On first run, the agent automatically creates its own wallet:
```bash
python main.py
```

Output:
```
Agent Wallet: 0x1f24eF014de80617470B2c4470FFB14CA4c20825
Private Key stored in .env (keep secret!)
```

### 2. Fund the Wallet

**Cronos Testnet (Recommended for Development):**
1. Go to: https://cronos.org/faucet
2. Paste agent address: `0x1f24eF014de80617470B2c4470FFB14CA4c20825`
3. Request test CRO
4. Wait for confirmation

**Cronos Mainnet (Production):**
1. Send CRO from your personal wallet to agent address
2. Recommended: Start with 10 CRO
3. Monitor balance regularly

### 3. Verify Wallet Balance
```bash
curl http://localhost:8000/api/agent/wallet/balance
```

Response:
```json
{
  "ok": true,
  "data": {
    "address": "0x1f24eF...",
    "balance_cro": 10.5,
    "balance_wei": "10500000000000000000",
    "needs_funding": false,
    "blockchain_url": "https://cronoscan.com/address/0x1f24eF..."
  }
}
```

## Project Structure

```
agent/
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI application
│   ├── config.py                  # Configuration management
│   ├── database.py                # SQLite database setup
│   ├── schemas.py                 # Pydantic models
│   ├── agent_wallet.py            # Wallet management
│   ├── ai_analyzer.py             # AI anomaly detection
│   └── guardian_service.py        # Core guardian logic
├── guardian.db                    # SQLite database (auto-created)
├── main.py                        # Entry point
├── pyproject.toml                 # Package configuration
├── .env                           # Environment variables
└── README.md                      # This file
```

## API Endpoints

### Wallet Management

**Get Wallet Balance**
```bash
GET /api/agent/wallet/balance

Response:
{
  "ok": true,
  "data": {
    "address": "0x...",
    "balance_cro": 10.5,
    "needs_funding": false
  }
}
```

**Get Wallet Status**
```bash
GET /api/agent/wallet/status

Response:
{
  "ok": true,
  "data": {
    "address": "0x...",
    "balance_cro": 10.5,
    "total_spent": 2.5,
    "transaction_count": 42,
    "ai_provider": "openai",
    "monitoring_active": true
  }
}
```

### Transaction Monitoring

**Analyze Transaction**
```bash
POST /api/agent/analyze
Content-Type: application/json

{
  "tx_hash": "0x...",
  "amount": "1.5",
  "recipient": "0x...",
  "api_id": "api-123"
}

Response:
{
  "ok": true,
  "data": {
    "is_anomaly": false,
    "confidence": 0.95,
    "reason": "Transaction appears normal",
    "should_pause": false
  }
}
```

**Get Anomaly Alerts**
```bash
GET /api/agent/alerts

Response:
{
  "ok": true,
  "data": [
    {
      "id": 1,
      "timestamp": "2026-01-23T10:30:00",
      "severity": "high",
      "message": "Unusual spending detected",
      "details": {
        "amount": "50.0",
        "api_id": "api-xyz",
        "frequency": "100 calls in 5 minutes"
      }
    }
  ]
}
```

### Transaction History

**Get Recent Transactions**
```bash
GET /api/agent/transactions?limit=10

Response:
{
  "ok": true,
  "data": [
    {
      "id": 1,
      "tx_hash": "0x...",
      "amount": "1.5",
      "recipient": "0x...",
      "api_id": "api-123",
      "timestamp": "2026-01-23T10:30:00",
      "status": "confirmed"
    }
  ]
}
```

## AI Anomaly Detection

The agent uses AI to detect unusual patterns:

### Detection Criteria
- **Frequency anomalies**: Too many calls in short time
- **Amount anomalies**: Unusually high payment amounts
- **Pattern anomalies**: Deviation from normal usage
- **Destination anomalies**: Payments to unusual recipients
- **Time anomalies**: Activity at unusual hours

### AI Analysis Process
1. Agent monitors blockchain transactions
2. Collects transaction history and patterns
3. Sends data to OpenAI/DeepSeek for analysis
4. AI evaluates risk level (0.0 to 1.0)
5. If risk > 0.7, agent flags as anomaly
6. Agent can auto-pause if risk > 0.9

### Example Analysis
```python
Transaction: $50 to API-XYZ
Normal pattern: $1-5, 10 times/day
AI Analysis: Anomaly detected (confidence: 0.95)
Reason: Amount 10x higher than normal
Action: Pause and alert user
```

## Configuration Options

### AI Provider Selection
```bash
# OpenAI (default)
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...

# DeepSeek (alternative)
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=...
```

### Network Configuration
```bash
# Testnet (development)
NETWORK=cronos-testnet
RPC_URL=https://evm-t3.cronos.org

# Mainnet (production)
NETWORK=cronos-mainnet
RPC_URL=https://evm.cronos.org
```

### Monitoring Settings
```python
# In app/config.py
ANOMALY_THRESHOLD = 0.7      # AI confidence threshold
AUTO_PAUSE_THRESHOLD = 0.9   # Auto-pause threshold
MONITORING_INTERVAL = 10     # Seconds between checks
MAX_DAILY_SPEND = 100.0      # Maximum daily spending limit
```

## Integration with Frontend

The frontend can integrate with the agent API:

```typescript
// Check agent status
const status = await fetch('http://localhost:8000/api/agent/wallet/status');

// Analyze before payment
const analysis = await fetch('http://localhost:8000/api/agent/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: '1.5',
    recipient: '0x...',
    api_id: 'api-123'
  })
});

if (analysis.should_pause) {
  alert('Payment blocked: Unusual activity detected');
}
```

## Security Best Practices

- **Never commit `.env` file** to version control
- **Rotate agent private key** periodically
- **Monitor agent wallet balance** regularly
- **Set spending limits** appropriate for your use case
- **Review anomaly alerts** promptly
- **Use testnet** for development and testing
- **Backup agent wallet** private key securely

## Monitoring and Logs

Agent logs transactions and anomalies:

```bash
# View logs
tail -f agent.log

# Database inspection
sqlite3 guardian.db
SELECT * FROM transactions ORDER BY timestamp DESC LIMIT 10;
SELECT * FROM anomalies WHERE severity = 'high';
```

## Common Issues

**Agent wallet has no funds:**
```bash
# Check balance
curl http://localhost:8000/api/agent/wallet/balance

# If needs_funding = true, fund the wallet
# See "Fund the Wallet" section above
```

**AI API key error:**
```
Error: Invalid API key

# Solution: Verify API key in .env
# OpenAI: https://platform.openai.com/api-keys
# DeepSeek: https://platform.deepseek.com
```

**Database locked:**
```
Error: Database is locked

# Solution: Close other agent instances
# Or delete guardian.db to reset (loses history)
```

## Testing

Run agent tests:
```bash
pytest tests/
```

Manual testing:
```bash
# Terminal 1: Start agent
python main.py

# Terminal 2: Test endpoints
curl http://localhost:8000/api/agent/wallet/status
curl http://localhost:8000/api/agent/alerts
```

## Production Deployment

1. Set environment to production:
```bash
NETWORK=cronos-mainnet
RPC_URL=https://evm.cronos.org
```

2. Fund agent wallet with real CRO

3. Configure monitoring and alerts

4. Run with process manager:
```bash
# Using systemd, pm2, or supervisor
pm2 start main.py --name ai-guardian
```

5. Set up monitoring and alerting

6. Regular balance checks and top-ups

## Support

For issues or questions, refer to the main [repository README](../README.md) or check [ARCHITECTURE.md](../ARCHITECTURE.md) for technical details.
