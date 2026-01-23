# 402Routes Frontend

## Prerequisites

- Node.js 20 or higher
- npm or yarn package manager
- MetaMask browser extension installed
- Backend service running (see [backend/README.md](../backend/README.md))
- Test CRO and USDC in MetaMask wallet on Cronos Testnet

## Installation

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.local.example .env.local
```

4. Configure environment variables in `.env.local`:
```bash
NEXT_PUBLIC_API_BASE=http://localhost:8787
```

5. Start the application:
```bash
npm run dev
```

The application will start on `http://localhost:3000`.

## Project Structure

```
frontend/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout with navigation
│   ├── page.tsx                      # Homepage/featured APIs
│   ├── globals.css                   # Global styles
│   ├── apis/
│   │   └── [id]/
│   │       └── page.tsx              # API detail and subscription
│   ├── discover/
│   │   └── page.tsx                  # Marketplace catalog
│   ├── publish/
│   │   └── page.tsx                  # Create new API listing
│   ├── execute/
│   │   └── [id]/
│   │       └── page.tsx              # API execution interface
│   ├── my-apis/
│   │   └── page.tsx                  # User's published APIs
│   ├── my-subscriptions/
│   │   └── page.tsx                  # User's active subscriptions
│   ├── guardian/
│   │   └── page.tsx                  # AI Guardian dashboard
│   └── components/
│       ├── ApiCard.tsx               # API listing card component
│       ├── ApiExecutor.tsx           # API call executor
│       └── CreateApiForm.tsx         # API creation form
├── src/
│   ├── lib/
│   │   └── api.ts                    # API client functions
│   ├── hooks/
│   │   └── useX402Flow.ts            # X402 payment flow hook
│   ├── utils/
│   │   ├── wallet.ts                 # MetaMask integration utilities
│   │   └── cronos.ts                 # Network switching helpers
│   └── types/
│       └── index.ts                  # TypeScript type definitions
├── public/                           # Static assets
├── package.json
├── next.config.ts                    # Next.js configuration
├── tailwind.config.ts                # TailwindCSS configuration
└── tsconfig.json                     # TypeScript configuration
```

## Application Routes

### Homepage (`/`)
- Featured APIs showcase
- Quick category navigation
- Call-to-action buttons
- Recent activity feed

### Discover (`/discover`)
- Complete marketplace catalog
- Category filters (Weather, Finance, AI, Gaming, Data)
- Sort options (price, popularity, recent)
- Search functionality
- API cards with key information

### API Detail (`/apis/[id]`)
- Complete API documentation
- Pricing and method information
- Subscribe/unsubscribe button
- 402-wrapped URL display (copy-pasteable)
- Integrated API executor
- Owner information and stats
- Subscription status indicator

### Execute API (`/execute/[id]`)
- Interactive API call interface
- Request payload JSON editor
- HTTP method selector
- Response viewer with syntax highlighting
- Payment flow automation
- Error messages and debugging info
- Payment ID management

### Publish API (`/publish`)
- Multi-step API creation form
- Field validation and preview
- Category selection
- Pricing configuration
- Submission to marketplace

### My APIs (`/my-apis`)
- List of user's published APIs
- Edit/delete functionality
- Revenue statistics
- Usage analytics per API
- Activity status toggle

### My Subscriptions (`/my-subscriptions`)
- Grid of active subscriptions
- Quick unsubscribe buttons
- Spending overview
- Direct access to API executors
- Subscription history

### Guardian Dashboard (`/guardian`)
- AI agent status and balance
- Transaction monitoring
- Anomaly alerts
- Spending charts
- Auto-payment configuration

## Key Features

### Wallet Integration
- Automatic MetaMask detection and connection
- Network switching to Cronos (Testnet/Mainnet)
- Wallet address display in navigation
- Balance checking before transactions
- Transaction signing with user approval

### X402 Payment Flow
Complete automation of the payment protocol:

1. User attempts API call
2. Receives 402 Payment Required challenge
3. Frontend detects challenge automatically
4. Prompts MetaMask for EIP-3009 signature
5. Submits signed payment to backend
6. Receives payment ID as entitlement
7. Retries API call with payment ID
8. Displays response
9. Stores payment ID for future calls

### Subscription Management
- One-click subscribe with wallet signature
- Instant unsubscribe functionality
- Subscription persisted in backend db.json
- Visual indicators for subscription status
- Access control based on subscriptions

### API Execution
- In-browser API testing without external tools
- JSON request editor with validation
- Response preview with syntax highlighting
- Error messages with detailed debugging
- Payment ID reuse for multiple calls
- Request/response history

### 402-Wrapped URLs
Each subscribed API provides a wrapped URL:
```
http://localhost:8787/api/proxy/{api-id}/{original-endpoint}
```

Benefits:
- Drop-in replacement for original API URL
- Automatic payment enforcement
- Works in browser or server-to-server
- Supports all HTTP methods (GET, POST, PUT, DELETE)
- Includes `x-payment-id` header for authentication

## Environment Configuration

### Development Setup
```bash
# .env.local
NEXT_PUBLIC_API_BASE=http://localhost:8787
```

### Production Setup
```bash
# .env.local
NEXT_PUBLIC_API_BASE=https://api.402routes.com
```

## Testing Workflow

### Manual Testing Flow

1. **Connect Wallet**
   - Open http://localhost:3000
   - Click "Connect Wallet" button
   - Approve MetaMask connection
   - Verify wallet address appears in navigation

2. **Browse APIs**
   - Navigate to `/discover`
   - Browse available APIs
   - Click on any API card
   - View complete API details

3. **Subscribe to API**
   - On API detail page, click "Subscribe"
   - Confirm MetaMask transaction
   - Wait for confirmation
   - Verify "Subscribed" status appears

4. **Execute API Call**
   - Click "Execute API" button
   - Enter request parameters if needed
   - Click "Execute"
   - Sign payment authorization in MetaMask
   - View API response

5. **Test Wrapped URL**
   - Copy 402-wrapped URL from API page
   - Test in external application (see [test/README.md](../test/README.md))
   - Or use in server-to-server integration

6. **Manage Subscriptions**
   - Go to `/my-subscriptions`
   - View all active subscriptions
   - Click trash icon to unsubscribe
   - Confirm removal

7. **Monitor with Guardian**
   - Navigate to `/guardian`
   - View agent wallet balance
   - Check transaction history
   - Review anomaly alerts

## Browser Compatibility

- **Chrome**: Fully supported (recommended)
- **Firefox**: Fully supported
- **Brave**: Supported with MetaMask extension
- **Edge**: Fully supported
- **Safari**: Limited support (MetaMask extension required)

## Styling and UI

Built with TailwindCSS 4:
- Fully responsive design (mobile-first approach)
- Modern purple/violet color scheme
- Smooth animations with Framer Motion
- Consistent spacing and typography
- Accessible components (WCAG AA compliant)
- Dark mode ready (optional configuration)

## Common Issues and Solutions

**MetaMask not detected:**
- Solution: Install MetaMask browser extension from metamask.io
- Refresh the page after installation
- Check browser console for specific errors

**Wrong network error:**
- Solution: Application automatically prompts network switch
- Approve switch to Cronos Testnet in MetaMask
- Ensure you have test CRO for gas fees

**API calls fail:**
- Solution: Verify backend is running on port 8787
- Check `NEXT_PUBLIC_API_BASE` in `.env.local`
- Open browser DevTools Network tab for details
- Verify CORS is configured correctly in backend

**Payment signature fails:**
- Solution: Ensure wallet has sufficient CRO for gas
- Verify wallet has USDC balance for payment
- Check network connection stability
- Try rejecting and retrying the signature

**Subscription not showing:**
- Solution: Refresh the page
- Check backend logs for errors
- Verify wallet address matches subscription record
- Clear browser cache if issue persists

## Build and Deployment

### Production Build
```bash
npm run build
```

Optimized output ready for deployment.

### Deploy to Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Other Platforms
- Netlify: Connect GitHub repo and deploy
- AWS Amplify: Import from repository
- Docker: Create Dockerfile with Node.js 20
- Static hosting: Requires Node.js server for API routes

## Security Best Practices

- Never expose private keys in client-side code
- Always validate wallet signatures on backend
- Use HTTPS in production environment
- Implement Content Security Policy (CSP) headers
- Sanitize all user inputs before display
- Rate limit API calls per wallet address
- Implement proper error boundaries
- Use environment variables for sensitive config

## Performance Optimization

- Next.js automatic code splitting per route
- Image optimization with next/image component
- Lazy loading of heavy components
- API response caching with SWR or React Query
- Debounced search inputs (300ms delay)
- Virtual scrolling for long lists
- Memoization of expensive computations

## Accessibility Features

- Semantic HTML structure throughout
- ARIA labels on all interactive elements
- Keyboard navigation support
- Screen reader friendly announcements
- High contrast color scheme
- Focus indicators on all interactive elements
- Alt text for all images

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Type checking
npx tsc --noEmit
```

## Integration with Other Services

### Backend API Integration
Frontend communicates with backend via REST API defined in `src/lib/api.ts`:

```typescript
const client = createApiClient();
await client.getAllApis();
await client.subscribeToApi(walletAddress, apiId);
await client.executeApi(apiId, paymentId, data);
```

### AI Guardian Integration
Frontend can query guardian status:

```typescript
const status = await fetch('http://localhost:8000/api/agent/wallet/status');
const alerts = await fetch('http://localhost:8000/api/agent/alerts');
```

### Test Client Integration
Users can test wrapped URLs in the standalone test client at http://localhost:5173

## Support and Documentation

For issues or questions:
- Check main [repository README](../README.md)
- Review [ARCHITECTURE.md](../ARCHITECTURE.md) for technical details
- See [USERFLOWS.md](../USERFLOWS.md) for complete user journeys
- Read [HACKATHON_GUIDE.md](../HACKATHON_GUIDE.md) for presentation guide

## Contributing

When contributing to frontend:
1. Follow Next.js and React best practices
2. Use TypeScript for type safety
3. Follow TailwindCSS utility-first approach
4. Write accessible HTML
5. Test on multiple browsers
6. Document new features in this README
