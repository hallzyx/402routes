# 402Routes Backend

## Prerequisites

- Node.js 20 or higher
- npm or yarn package manager
- Cronos Testnet RPC access
- USDC contract address on Cronos Testnet
- MetaMask wallet with test CRO and USDC

## Installation

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```bash
NODE_ENV=development
PORT=8787
NETWORK=cronos-testnet
ASSET_ADDRESS=0x... # USDC contract address on Cronos Testnet
DEFAULT_PRICE=1000000 # Default price in micro-units (1 USDC)
FRONTEND_URL=http://localhost:3000
```

5. Start the server:
```bash
npm run dev
```

The server will start on `http://localhost:8787`.
- `PORT`: Server port (default: 8787)
- `NETWORK`: 'cronos-testnet' or 'cronos-mainnet'
- `ASSET_ADDRESS`: ERC-20 token address for payments (USDC)
- `DEFAULT_PRICE`: Fallback price per API call in token micro-units
- `FRONTEND_URL`: CORS-allowed origin for frontend requests

## Running the Service

Development mode (with hot reload):
```bash
npm run dev
```

Production build:
```bash
npm run build
npm start
```

The service will start on `http://localhost:8787` (or your configured PORT).

## Project Structure

```
backend/
├── src/
│   ├── index.ts                      # Express app entry point
│   ├── config/
│   │   └── x402.config.ts            # X402 and network configuration
│   ├── types/
│   │   └── index.ts                  # TypeScript type definitions
│   ├── middlewares/
│   │   └── x402.middleware.ts        # Payment enforcement logic
│   ├── services/
│   │   └── marketplace.service.ts    # Business logic layer
│   ├── controllers/
│   │   └── marketplace.controller.ts # Request handlers
│   └── routes/
│       ├── index.ts                  # Route registration
│       └── marketplace.routes.ts     # API endpoints
├── db.json                           # Demo storage (replace in production)
├── package.json
├── tsconfig.json
└── .env.example
```

## API Endpoints

### Marketplace Endpoints

**List all APIs**
```
GET /api/marketplace
Response: Array of API listings
```

**Get API by ID**
```
GET /api/marketplace/:id
Response: API listing object
```

**Create new API**
```
POST /api/marketplace
Body: {
  name: string,
  description: string,
  category: string,
  baseUrl: string,
  endpoint: string,
  method: string,
  pricePerCall: string,
  ownerAddress: string
}
Response: Created API object
```

**Update API**
```
PUT /api/marketplace/:id
Body: Partial API object
Response: Updated API object
```

**Delete API**
```
DELETE /api/marketplace/:id
Response: Success message
```

### Subscription Endpoints

**Subscribe to API**
```
POST /api/subscriptions
Body: {
  walletAddress: string,
  apiId: string
}
Response: Subscription object
```

**Unsubscribe from API**
```
DELETE /api/subscriptions
Body: {
  walletAddress: string,
  apiId: string
}
Response: Success message
```

**Get user subscriptions**
```
GET /api/subscriptions?walletAddress=0x...
Response: Array of subscriptions with API details
```

### Payment & Execution Endpoints

**Settle X402 payment**
```
POST /api/pay
Body: {
  paymentId: string,
  paymentHeader: string,
  paymentRequirements: object
}
Response: {
  ok: boolean,
  txHash?: string,
  error?: string
}
```

**Execute API call (protected)**
```
POST /api/execute/:id
Headers: {
  x-payment-id?: string
}
Body: API request payload
Response: API response or 402 Payment Required
```

**Proxy endpoint (402-wrapped)**
```
GET|POST /api/proxy/:apiId/*
Headers: {
  x-payment-id?: string
}
Response: Proxied API response or 402 Payment Required
```

## X402 Payment Flow

1. Client calls protected endpoint without payment
2. Middleware checks for `x-payment-id` header
3. If no valid entitlement exists, return 402 with X402 challenge:
```json
{
  "x402Version": 1,
  "error": "payment_required",
  "accepts": [{
    "network": "cronos-testnet",
    "asset": "0x...",
    "amount": "1000000",
    "recipient": "0x..."
  }]
}
```
4. Client generates EIP-3009 payment signature
5. Client posts signed payment to `/api/pay`
6. Backend verifies signature (off-chain, free)
7. Backend settles payment on-chain via Facilitator
8. Backend stores payment ID as entitlement
9. Client retries request with `x-payment-id` header
10. Middleware validates entitlement and proxies request

## Data Storage

Demo mode uses `db.json` in the backend root with the following structure:

```json
{
  "apis": [...],          // API listings
  "subscriptions": [...], // User subscriptions
  "wallets": [...],       // Registered wallets
  "transactions": [...]   // Payment history
}
```

For production:
- Replace with PostgreSQL, MongoDB, or Redis
- Implement proper indexing for wallet addresses and API IDs
- Add transaction history pruning
- Implement backup and recovery mechanisms

## Testing

Example curl requests:

**List APIs:**
```bash
curl http://localhost:8787/api/marketplace
```

**Subscribe to API:**
```bash
curl -X POST http://localhost:8787/api/subscriptions \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0xYourWalletAddress",
    "apiId": "api-id-here"
  }'
```

**Execute API call:**
```bash
curl -X POST http://localhost:8787/api/execute/api-id \
  -H "Content-Type: application/json" \
  -H "x-payment-id: payment-id-from-settlement" \
  -d '{"param": "value"}'
```

## Troubleshooting

**Port already in use:**
```bash
# Change PORT in .env or kill the process using port 8787
lsof -ti:8787 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :8787   # Windows
```

**CORS errors:**
- Verify `FRONTEND_URL` in `.env` matches your frontend URL
- Check that frontend is running on the specified URL

**Payment settlement fails:**
- Verify `ASSET_ADDRESS` is correct for your network
- Ensure Facilitator SDK has proper network configuration
- Check wallet has sufficient CRO for gas fees

## Security Considerations

- Never commit `.env` file to version control
- Rotate private keys regularly
- Implement rate limiting for production
- Add request validation and sanitization
- Use HTTPS in production
- Implement proper error handling without exposing internals

## Production Deployment

1. Set `NODE_ENV=production`
2. Replace db.json with proper database
3. Configure production RPC endpoints
4. Enable HTTPS with SSL certificates
5. Set up monitoring and logging
6. Implement backup strategies
7. Configure rate limiting and DDoS protection
8. Set up CI/CD pipeline

## Support

For issues or questions, refer to the main [repository README](../README.md) or check [ARCHITECTURE.md](../ARCHITECTURE.md) for technical details.
