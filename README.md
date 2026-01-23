# 402Routes

A decentralized API marketplace that replaces traditional API keys with blockchain-based per-call payments using the X402 protocol on Cronos. Think RapidAPI meets Web3: developers publish APIs, users pay per request with USDC, and everything is settled on-chain instantly.

## What Problem We Solve

Traditional API marketplaces require:
- Monthly subscriptions for APIs you rarely use
- API keys that can be stolen or leaked
- Complex billing systems and payment processors
- Trust in centralized platforms

402Routes eliminates these friction points by:
- Pay-per-call pricing: only pay for what you use
- Wallet-based authentication: your wallet is your API key
- Instant on-chain settlement via X402 and EIP-3009
- Decentralized and transparent payment tracking

## Core Functionalities

### 1. API Marketplace
- Browse and discover third-party APIs
- View pricing, endpoints, and real-time availability
- Subscribe to APIs with your wallet (no monthly fees)
- Get a unique 402-wrapped URL for each API

### 2. X402 Payment Protocol
- Automatic payment enforcement on protected endpoints
- EIP-3009 signature-based payment authorization
- Off-chain verification with on-chain settlement via Facilitator SDK
- Reusable payment IDs for subsequent calls (entitlements)

### 3. Subscription Management
- Subscribe/unsubscribe to APIs with wallet signature
- View all active subscriptions in your dashboard
- Track spending per API in real-time
- Manage subscriptions without intermediaries

### 4. AI Budget Guardian (Autonomous Agent)
- AI agent with its own wallet for autonomous payments
- Real-time transaction monitoring and anomaly detection
- Automatic spending optimization and budget protection
- Intelligent alerts for unusual payment patterns

### 5. Developer Tools
- Publish APIs with custom pricing
- Test APIs directly in the browser
- Copy 402-wrapped URLs for server-to-server integration
- View API usage statistics and revenue

## System Architecture

This monorepo contains four main applications:

### Backend (Express + TypeScript)
RESTful API service handling marketplace operations, X402 payment enforcement, and API proxying.
- [Installation Guide](./backend/README.md)

### Frontend (Next.js + React)
Modern web interface for browsing, subscribing, and executing APIs with wallet integration.
- [Installation Guide](./frontend/README.md)

### Test Client (Vite + React)
Standalone test application for validating 402-wrapped links and per-call X402 payments.
- [Installation Guide](./test/README.md)

### AI Budget Guardian (Python + FastAPI)
Autonomous AI agent that manages automatic payments and monitors transactions for unusual behavior.
- [Installation Guide](./agent/README.md)

## How It Works (Technical Flow)

### Publishing an API
1. Developer connects wallet to frontend
2. Submits API details (name, endpoint, price, method)
3. Backend stores API listing in marketplace
4. System generates 402-wrapped proxy URL
5. API is now discoverable and protected by X402

### Consuming an API
1. User browses marketplace and selects an API
2. User subscribes (recorded in db.json with wallet address)
3. User receives the 402-wrapped endpoint URL
4. First call to wrapped URL returns `402 Payment Required` with X402 challenge
5. Frontend prompts wallet to sign EIP-3009 payment authorization
6. Signed payment is submitted to `/api/pay` endpoint
7. Backend verifies signature off-chain and settles on-chain via Facilitator
8. Backend stores payment ID as entitlement
9. User retries call with `x-payment-id` header
10. Backend proxies request to original API and returns response
11. Subsequent calls reuse the same payment ID (no additional payment needed)

### AI Budget Guardian Flow
1. User deposits funds to agent wallet
2. Agent monitors all transactions in real-time
3. AI analyzes spending patterns using OpenAI/DeepSeek
4. Agent detects anomalies (unusual frequency, amount, or destination)
5. Agent automatically pauses suspicious transactions
6. User receives alerts and can review/approve transactions
7. Agent resumes normal operation after verification

## Quick Start

### Prerequisites
- Node.js 20+
- Python 3.10+ (for AI agent)
- MetaMask or compatible wallet
- Test CRO and USDC on Cronos Testnet

### Installation

Each application has its own detailed installation guide:

1. **Backend Service**: [backend/README.md](./backend/README.md)
   - Express API with X402 middleware
   - Runs on port 8787

2. **Frontend Application**: [frontend/README.md](./frontend/README.md)
   - Next.js web interface
   - Runs on port 3000

3. **Test Client**: [test/README.md](./test/README.md)
   - Standalone validation tool
   - Runs on port 5173

4. **AI Budget Guardian**: [agent/README.md](./agent/README.md)
   - Autonomous payment agent
   - Runs on port 8000

### Running All Services

```bash
# Terminal 1: Backend
cd backend && npm install && npm run dev

# Terminal 2: Frontend
cd frontend && npm install && npm run dev

# Terminal 3: AI Agent (optional)
cd agent && pip install -e . && python main.py

# Terminal 4: Test Client (optional)
cd test && npm install && npm run dev
```

## API Endpoints

### Public Endpoints

- `GET /health` - Health check
- `GET /api/marketplace` - List all APIs
- `GET /api/marketplace/:id` - Get API details
- `POST /api/marketplace` - Create new API
- `PUT /api/marketplace/:id` - Update API
- `DELETE /api/marketplace/:id` - Delete API
- `Key API Endpoints

### Marketplace Operations
- `GET /api/marketplace` - List all active APIs
- `GET /api/marketplace/:id` - Get API details
- `POST /api/marketplace` - Publish new API
- `PUT /api/marketplace/:id` - Update API
- `DELETE /api/marketplace/:id` - Delete/deactivate API

### Subscription Management
- `POST /api/subscriptions` - Subscribe to an API
- `DELETE /api/subscriptions` - Unsubscribe from an API
- `GET /api/subscriptions?walletAddress=...` - Get user subscriptions

### Payment & Execution
- `POST /api/pay` - Settle X402 payment
- `POST /api/execute/:id` - Execute API call (protected)
- `GET|POST /api/proxy/:apiId/*` - 402-wrapped proxy endpoint

### AI Agent Endpoints
- `GET /api/agent/wallet/balance` - Check agent wallet balance
- `GET /api/agent/wallet/status` - Get agent status and stats
- `POST /api/agent/analyze` - Analyze transaction pattern
- `GET /api/agent/alerts` - Get anomaly alerts

## Technology Stack

**Backend**
- Express.js with TypeScript
- Facilitator SDK for X402 integration
- Ethers.js for blockchain interaction
- In-memory storage (db.json for demo)

**Frontend**
- Next.js 15 with App Router
- React 19 with TypeScript
- TailwindCSS for styling
- Ethers.js for wallet integration

**AI Agent**
- FastAPI for REST API
- OpenAI/DeepSeek for AI analysis
- Web3.py for blockchain monitoring
- SQLite for transaction history

**Blockchain**
- Cronos Testnet/Mainnet
- X402 Protocol
- EIP-3009 payment signatures
- USDC as payment token

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed technical architecture
- [USERFLOWS.md](./USERFLOWS.md) - Complete user flow diagrams
- [HACKATHON_GUIDE.md](./HACKATHON_GUIDE.md) - Judge presentation guide

## Demo & Testing

For hackathon judges: See [HACKATHON_GUIDE.md](./HACKATHON_GUIDE.md) for a complete walkthrough without needing to run the application.

## Production Roadmap

- Replace db.json with PostgreSQL or MongoDB
- Implement rate limiting and DDoS protection
- Add API analytics dashboard for publishers
- Implement revenue distribution and withdrawal system
- Deploy to decentralized hosting (IPFS + Fleek)
- Add support for multiple payment tokens
- Implement governance for marketplace rules

## License

MIT