# 402Routes Test Client

## Prerequisites

- Node.js 20 or higher
- npm or yarn package manager
- MetaMask browser extension installed
- Backend service running (see [backend/README.md](../backend/README.md))
- Test CRO and USDC in MetaMask wallet on Cronos Testnet

## Installation

1. Navigate to test directory:
```bash
cd test
```

2. Install dependencies:
```bash
npm install
```

3. Start the application:
```bash
npm run dev
```

The application will start on `http://localhost:5173`.

## Project Structure

```
test/
├── src/
│   ├── App.tsx                       # Main application component
│   ├── main.tsx                      # Entry point
│   ├── App.css                       # Component styles
│   ├── index.css                     # Global styles
│   ├── assets/                       # Static assets
│   └── utils/
│       └── x402.ts                   # X402 payment utilities
├── public/                           # Public static files
├── index.html                        # HTML template
├── package.json                      # Dependencies
├── vite.config.ts                    # Vite configuration
└── tsconfig.json                     # TypeScript configuration
```

## How to Use

### Step 1: Get a 402-Wrapped URL

From the main frontend application:
1. Navigate to any API detail page
2. Subscribe to the API
3. Copy the 402-wrapped URL displayed:
   ```
   http://localhost:8787/api/proxy/{api-id}/{endpoint}
   ```

Example wrapped URLs:
```
http://localhost:8787/api/proxy/7b5721e4-6350-4160-aa07-d29759a8e70a/v1/current.json
http://localhost:8787/api/proxy/553b6511-2e3c-44f6-8cb8-b0db76bcd1e9/api/v1/quote
http://localhost:8787/api/proxy/ca85d906-0564-4347-8069-4e5f59f2a86c/yes
```

### Step 2: Test in Test Client

1. Open test client at http://localhost:5173
2. Paste the 402-wrapped URL into the input field
3. Select HTTP method (GET/POST/PUT/DELETE)
4. Add request body if needed (JSON format)
5. Click "Call API" button

### Step 3: Handle Payment Flow

First call without payment:
1. Receives `402 Payment Required` response
2. Test client displays payment challenge
3. Shows payment requirements (amount, recipient, network)

Connect wallet and authorize payment:
1. Click "Connect Wallet" button
2. Approve MetaMask connection
3. Client detects Cronos network (switches if needed)
4. Click "Pay and Execute" button
5. Sign EIP-3009 payment authorization in MetaMask
6. Payment is verified and settled on-chain
7. Client automatically retries with payment ID

View response:
1. API response displayed in formatted JSON
2. Payment ID stored for subsequent calls
3. Status code and headers shown

### Step 4: Make Subsequent Calls

With existing payment ID:
1. Keep same wrapped URL
2. Click "Call API" again
3. No payment prompt (reuses payment ID)
4. Response appears immediately
5. Payment ID persists across page reloads

## Features

### X402 Protocol Testing

Complete implementation of X402 payment flow:
- Automatic 402 challenge detection
- Payment requirement parsing
- EIP-3009 signature generation
- Payment submission to backend
- Entitlement validation
- Error handling and retry logic

### Wallet Integration

MetaMask connection and management:
- Automatic wallet detection
- Network switching to Cronos
- Balance checking before payment
- Transaction signing
- Gas estimation

### Request Configuration

Flexible API call configuration:
- All HTTP methods supported (GET, POST, PUT, DELETE)
- Custom headers support
- JSON payload editor for POST/PUT
- Query parameters in URL
- Response viewer with formatting

### Response Display

Comprehensive response information:
- Formatted JSON display
- HTTP status code
- Response headers
- Error messages with details
- Execution time
- Payment ID used

## Use Cases

### 1. Development Testing

Test 402-wrapped endpoints during development without the full marketplace UI:

```bash
# Terminal 1: Start backend
cd backend && npm run dev

# Terminal 2: Start test client
cd test && npm run dev

# Terminal 3: Start AI agent (optional)
cd agent && python main.py

# Test any wrapped URL in the test client
```

### 2. Integration Validation

Validate that external applications can integrate with 402-wrapped APIs:
- Copy wrapped URL from marketplace
- Test in isolated environment
- Verify payment flow works correctly
- Confirm response format matches expectations
- Test error scenarios

### 3. Debugging and Troubleshooting

Debug payment issues and API responses:
- View raw 402 challenge JSON
- Inspect payment signature details
- Monitor network requests in DevTools
- Test different error scenarios
- Validate payment ID persistence

### 4. External Developer Examples

Demonstrate integration patterns for external developers:
- Browser-based integration example
- Payment flow implementation reference
- Error handling patterns
- Wallet connection best practices

## Example Test Scenarios

### Scenario 1: Test Valid Payment Flow

```
URL: http://localhost:8787/api/proxy/7b5721e4-6350-4160-aa07-d29759a8e70a/v1/current.json
Method: GET
Expected: 402 → Connect Wallet → Pay → Success Response
```

### Scenario 2: Test Reused Payment ID

```
First call: 402 → Pay → Success
Second call: Success (no payment, reuses payment ID)
Third call: Success (still no payment)
```

### Scenario 3: Test Different HTTP Methods

```
POST: http://localhost:8787/api/proxy/{api-id}/endpoint
Body: {"key": "value"}
Expected: 402 → Pay → Success with response body
```

### Scenario 4: Test Invalid API ID

```
URL: http://localhost:8787/api/proxy/invalid-id/endpoint
Expected: 404 API Not Found
```

### Scenario 5: Test Network Error

```
Stop backend service
URL: Any wrapped URL
Expected: Connection refused or network error
```

### Scenario 6: Test Payment Rejection

```
URL: Valid wrapped URL
Action: Reject payment in MetaMask
Expected: Payment failed, can retry
```

## Configuration

Test client uses hardcoded defaults but can be modified in `src/utils/x402.ts`:

```typescript
const API_BASE = 'http://localhost:8787';
const NETWORK = 'cronos-testnet';
const NETWORK_CHAIN_ID = 338;
```

For production testing, update these values:

```typescript
const API_BASE = 'https://api.402routes.com';
const NETWORK = 'cronos-mainnet';
const NETWORK_CHAIN_ID = 25;
```

## Common Issues and Solutions

**Connection refused:**
- Solution: Ensure backend is running on port 8787
- Check firewall settings
- Verify CORS is enabled in backend

**Payment fails:**
- Solution: Verify wallet has CRO for gas fees
- Confirm wallet has USDC balance for payment
- Check network is set to Cronos Testnet
- Review MetaMask transaction details

**Wrong network error:**
- Solution: MetaMask must be on Cronos network
- Test client will show network mismatch
- Approve network switch when prompted
- Ensure correct network configuration

**CORS errors:**
- Solution: Backend must allow test client origin
- Check backend CORS configuration
- Add http://localhost:5173 to allowed origins
- Restart backend after CORS changes

**Payment ID not persisting:**
- Solution: Check browser local storage
- Clear cache and reload
- Verify payment ID is returned from backend
- Check browser console for errors

**402 challenge not appearing:**
- Solution: Verify URL is correct 402-wrapped format
- Check backend X402 middleware is active
- Ensure API requires payment
- Review backend logs for errors

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npx tsc --noEmit

# Lint code
npm run lint (if configured)
```

## Build for Production

```bash
# Build optimized bundle
npm run build

# Output directory: dist/
# Deploy dist/ folder to any static hosting
```

## Differences from Main Frontend

Comparison with marketplace frontend:

| Feature | Main Frontend | Test Client |
|---------|--------------|-------------|
| UI Complexity | Full marketplace | Minimal single page |
| Features | Browse, subscribe, publish | Test wrapped URLs only |
| Navigation | Multi-page routing | Single page |
| User Management | Account system | Wallet only |
| API Discovery | Full catalog | URL input |
| Subscription | Managed system | N/A |
| Purpose | End-user application | Developer testing tool |

## When to Use Each Client

**Use Test Client when:**
- Testing wrapped URLs quickly
- Validating payment integration
- Debugging 402 challenges
- Verifying external integration
- Running automated tests
- Demonstrating payment flow
- Developing integrations

**Use Main Frontend when:**
- Browsing marketplace
- Managing subscriptions
- Publishing APIs
- Viewing analytics
- Full user experience
- End-user application

## Integration Example

External applications can follow this test client pattern:

```typescript
// 1. Call wrapped URL
const response = await fetch(wrappedUrl);

// 2. Check for 402
if (response.status === 402) {
  const challenge = await response.json();
  
  // 3. Generate payment signature
  const signature = await generateEIP3009Signature(challenge);
  
  // 4. Submit payment
  await fetch('/api/pay', {
    method: 'POST',
    body: JSON.stringify({
      paymentId: challenge.paymentId,
      paymentHeader: signature,
      paymentRequirements: challenge.accepts[0]
    })
  });
  
  // 5. Retry with payment ID
  const retryResponse = await fetch(wrappedUrl, {
    headers: { 'x-payment-id': challenge.paymentId }
  });
  
  return retryResponse.json();
}

return response.json();
```

## Testing with AI Guardian

Test client can interact with AI-paid APIs:

1. User funds AI agent wallet
2. Agent wallet is configured to auto-pay for user
3. User makes API call through test client
4. Backend detects agent wallet association
5. Agent automatically pays on behalf of user
6. No MetaMask signature required
7. Response returned immediately

See [agent/README.md](../agent/README.md) for guardian configuration.

## Support and Documentation

For issues or questions:
- Review main [repository README](../README.md)
- Check [ARCHITECTURE.md](../ARCHITECTURE.md) for technical details
- See [USERFLOWS.md](../USERFLOWS.md) for complete flows
- Read [HACKATHON_GUIDE.md](../HACKATHON_GUIDE.md) for presentation guide

## Example Code Snippets

### Basic API Call
```typescript
const response = await fetch(
  'http://localhost:8787/api/proxy/api-id/endpoint'
);
const data = await response.json();
```

### With Payment ID
```typescript
const response = await fetch(
  'http://localhost:8787/api/proxy/api-id/endpoint',
  {
    headers: {
      'x-payment-id': storedPaymentId
    }
  }
);
```

### POST with Body
```typescript
const response = await fetch(
  'http://localhost:8787/api/proxy/api-id/endpoint',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-payment-id': storedPaymentId
    },
    body: JSON.stringify({ param: 'value' })
  }
);
```

## Contributing

When contributing to test client:
1. Keep UI minimal and focused
2. Follow Vite + React best practices
3. Use TypeScript for type safety
4. Test payment flow thoroughly
5. Document new features in this README
6. Maintain compatibility with backend API
