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

## Business Model

### Revenue Structure
402Routes charges a minimal **3% transaction fee** on each API call payment. This is significantly lower than traditional API marketplaces:

| Platform | Fee Structure | Developer Earnings (per $100) |
|----------|---------------|-------------------------------|
| **RapidAPI** | 20% platform + 5% Stripe = **25%** | **$75** |
| **402Routes** | **3%** transaction fee | **$97** |

**Why 3% is game-changing:**
- Developers keep **97% of revenue** vs 75% on RapidAPI
- **29% more earnings** for the same API usage
- No hidden fees, no currency conversion charges
- Instant settlement, no 7-14 day delays
- Global accessibility without geographic discrimination

### How It Works
1. API consumer pays $1.00 USDC per API call
2. 402Routes takes $0.03 (3%)
3. API publisher receives $0.97 instantly on-chain
4. No additional processing fees, no chargebacks, no disputes

### Sustainability
With a 3% fee structure:
- **Break-even**: ~50,000 API calls per month at $1 average price
- **Operational costs**: Covered by minimal infrastructure (Cronos gas fees are negligible)
- **Scalability**: As volume grows, margins improve due to fixed infrastructure costs
- **Competitive advantage**: 8x lower fees than incumbents creates massive developer retention

## Growth Roadmap (12 Months)

### Phase 1: MVP & Launch (Months 1-3)
**Month 1: Hackathon & Beta Launch**
- Launch on Cronos testnet with 5-10 demo APIs
- Onboard first 50 beta testers (developers)
- Target: 1,000 API calls, validate payment flow
- Milestone: Win BUIDL Asia hackathon

**Month 2: Mainnet Deployment**
- Deploy to Cronos mainnet
- Integrate Crypto.com Pay for fiat on/off ramps
- Onboard first 10 real API publishers
- Target: 5,000 API calls, $5,000 GMV (Gross Merchandise Value)
- Launch developer documentation and SDK

**Month 3: Early Traction**
- Add email-based embedded wallets (non-crypto developers)
- Partner with 3-5 developer communities (Reddit, Discord)
- Target: 50 active APIs, 20,000 calls, $20,000 GMV
- Implement basic analytics dashboard

### Phase 2: Product-Market Fit (Months 4-6)
**Month 4: Horizontal Expansion**
- Launch API categories (Weather, Finance, AI, Gaming, Data)
- Implement search and filtering
- Add API versioning support
- Target: 100 APIs, 50,000 calls, $50,000 GMV
- First $1,500 in platform revenue (3% of GMV)

**Month 5: Developer Experience**
- Release Python, JavaScript, and Go SDKs
- Add API testing playground
- Implement rate limiting and quota management
- Target: 200 APIs, 100,000 calls, $100,000 GMV
- Platform revenue: $3,000/month

**Month 6: AI Agent Enhancement**
- Launch AI Budget Guardian v2 with ML-based fraud detection
- Add spending predictions and recommendations
- Implement multi-user wallet support
- Target: 350 APIs, 200,000 calls, $200,000 GMV
- Platform revenue: $6,000/month

### Phase 3: Scale & Network Effects (Months 7-9)
**Month 7: Enterprise Features**
- Launch team accounts and organization management
- Add API bundling (multiple APIs in one subscription)
- Implement SLA guarantees and uptime monitoring
- Target: 500 APIs, 350,000 calls, $350,000 GMV
- Platform revenue: $10,500/month

**Month 8: Geographic Expansion**
- Marketing push in LATAM, Africa, and Asia
- Partner with Crypto.com for regional fiat support
- Add multi-language support (Spanish, Portuguese, Hindi)
- Target: 750 APIs, 600,000 calls, $600,000 GMV
- Platform revenue: $18,000/month

**Month 9: Ecosystem Growth**
- Launch API marketplace grants ($50k fund for top publishers)
- Implement reputation system and reviews
- Add API composition (chain multiple APIs)
- Target: 1,000 APIs, 1M calls, $1M GMV
- Platform revenue: $30,000/month

### Phase 4: Maturity & Leadership (Months 10-12)
**Month 10: Advanced Features**
- Launch API analytics pro (revenue insights, user behavior)
- Add webhook support for real-time notifications
- Implement GraphQL and gRPC support
- Target: 1,500 APIs, 1.5M calls, $1.5M GMV
- Platform revenue: $45,000/month

**Month 11: Strategic Partnerships**
- Partner with 3 major API providers to migrate from RapidAPI
- Integrate with GitHub, VS Code, and Postman
- Launch developer ambassador program
- Target: 2,000 APIs, 2.5M calls, $2.5M GMV
- Platform revenue: $75,000/month

**Month 12: Market Leadership**
- Reach 3,000+ APIs (1% of RapidAPI's catalog)
- Process 4M+ API calls ($4M+ GMV)
- Platform revenue: $120,000/month ($1.44M annualized)
- Announce Series A fundraising
- Begin expansion to Ethereum L2s and other EVM chains

### Key Metrics by Year End
- **Total APIs Published**: 3,000+
- **Active Developers (Publishers)**: 1,500+
- **Active API Consumers**: 10,000+
- **Total API Calls**: 15M+
- **Gross Merchandise Value**: $15M+
- **Platform Revenue**: $450,000 (3% of GMV)
- **Market Position**: Top 3 blockchain-based API marketplace

### Revenue Projections (Conservative)
| Quarter | GMV | Platform Revenue (3%) | Growth Rate |
|---------|-----|----------------------|-------------|
| Q1 (Months 1-3) | $75,000 | $2,250 | - |
| Q2 (Months 4-6) | $350,000 | $10,500 | 367% |
| Q3 (Months 7-9) | $1,950,000 | $58,500 | 457% |
| Q4 (Months 10-12) | $8,000,000 | $240,000 | 310% |
| **Year 1 Total** | **$10,375,000** | **$311,250** | **Avg 378% QoQ** |

### Success Factors
1. **Timing**: Web3 payments ready, but UX still broken - we fix this
2. **Economics**: 97% vs 75% earnings is a no-brainer for developers
3. **Network effects**: More APIs attract more users, more users attract more APIs
4. **Crypto.com ecosystem**: Seamless fiat on/off ramps reduce friction
5. **AI Guardian**: Unique value proposition that traditional marketplaces can't replicate

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