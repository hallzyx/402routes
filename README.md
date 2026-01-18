# 402Routes - API Marketplace with X402 Payments

A decentralized API marketplace where developers can publish and monetize their APIs using the X402 payment protocol on Cronos blockchain.

## Features

- **Publish APIs**: Developers can list their APIs with custom pricing
- **Discover APIs**: Browse a marketplace of available APIs
- **Pay-per-use**: Use X402 protocol for instant, blockchain-based payments
- **No API Keys**: Authentication via wallet signatures (EIP-3009)
- **Instant Settlement**: Payments are verified and settled on-chain

## Architecture

### Backend (Express + TypeScript)
- RESTful API for marketplace CRUD operations
- X402 middleware for payment enforcement
- Facilitator SDK integration for payment verification and settlement
- In-memory storage (replace with database for production)

### Frontend (Next.js + React)
- Modern UI with TailwindCSS
- Wallet integration (MetaMask)
- X402 payment flow with automatic network switching
- Real-time API testing interface

## User Flows

### Flow 1: Publish API for Monetization

1. Connect wallet (MetaMask)
2. Click "Publish API"
3. Fill in API details:
   - Name and description
   - Category
   - Endpoint path
   - HTTP method
   - Price per call
4. Submit to marketplace
5. API is now available for others to use (paid)

### Flow 2: Use API from Marketplace

1. Browse marketplace
2. Select an API
3. Enter request data (JSON)
4. Click "Execute API Call"
5. Wallet prompts for payment signature (X402/EIP-3009)
6. Payment is verified and settled on-chain
7. API call executes and returns data
8. Can reuse payment ID for subsequent calls (entitlement)

## Setup

### Prerequisites

- Node.js 20+
- MetaMask or compatible wallet
- Test CRO on Cronos Testnet
- Test USDC on Cronos Testnet

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```bash
NODE_ENV=development
PORT=8787
NETWORK=cronos-testnet
ASSET_ADDRESS=0x... # USDC on Cronos Testnet
DEFAULT_PRICE=1000000
FRONTEND_URL=http://localhost:3000
```

Run:
```bash
npm run dev
```

Backend runs on `http://localhost:8787`

### Frontend Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
```

Edit `.env.local`:
```bash
NEXT_PUBLIC_API_BASE=http://localhost:8787
```

Run:
```bash
npm run dev
```

Frontend runs on `http://localhost:3000`

## API Endpoints

### Public Endpoints

- `GET /health` - Health check
- `GET /api/marketplace` - List all APIs
- `GET /api/marketplace/:id` - Get API details
- `POST /api/marketplace` - Create new API
- `PUT /api/marketplace/:id` - Update API
- `DELETE /api/marketplace/:id` - Delete API
- `POST /api/pay` - Settle X402 payment

### Protected Endpoints (Require X402 Payment)

- `POST /api/execute/:id` - Execute API call (requires payment)

## X402 Payment Flow

1. Client requests protected endpoint
2. Backend responds with `402 Payment Required` + X402 challenge
3. Frontend prompts user to sign payment authorization (EIP-3009)
4. Frontend posts signed payment to `/api/pay`
5. Backend verifies signature off-chain
6. Backend settles payment on-chain via Facilitator
7. Backend records entitlement (payment ID)
8. Client retries request with `x-payment-id` header
9. Backend grants access to protected resource

## Technologies

- **Backend**: Express, TypeScript, @crypto.com/facilitator-client
- **Frontend**: Next.js, React, TailwindCSS, ethers.js
- **Blockchain**: Cronos (Testnet/Mainnet)
- **Protocol**: X402, EIP-3009
- **Payment**: USDC (or any ERC-20 token)

## Production Considerations

- Replace in-memory storage with Redis or database
- Add rate limiting and DDoS protection
- Implement API key management for owners
- Add authentication/authorization for API CRUD
- Proxy actual API calls instead of mock responses
- Add monitoring and logging
- Deploy to production infrastructure

## License

MIT
# 402routes
