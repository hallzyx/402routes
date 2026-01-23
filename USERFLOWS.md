# User Flows

Complete walkthrough of all user interactions in the 402Routes marketplace. These flows demonstrate how users interact with the system without requiring execution.

## Flow 1: Publishing an API

**Actor:** API Provider (Developer)

**Goal:** List an API in the marketplace to monetize it

**Steps:**

1. **Connect Wallet**
   - User opens frontend at http://localhost:3000
   - Clicks "Connect Wallet" in top navigation
   - MetaMask extension prompts for connection
   - User approves connection
   - Wallet address displays in navigation bar

2. **Navigate to Publish Page**
   - User clicks "Publish API" in navigation
   - Or navigates to `/publish`
   - Form appears with empty fields

3. **Fill API Details**
   - **Name**: "Weather API" (example)
   - **Description**: "Get current weather data for any city"
   - **Category**: Select from dropdown (Weather, Finance, AI, etc.)
   - **Base URL**: "https://api.weatherapi.com"
   - **Endpoint**: "/v1/current.json"
   - **HTTP Method**: Select GET/POST/PUT/DELETE
   - **Price per Call**: "0.001" (in USDC)

4. **Submit API**
   - User clicks "Publish API" button
   - Frontend validates all fields
   - Request sent to `POST /api/marketplace`
   - Backend creates API listing
   - Backend generates unique API ID
   - Success message displayed

5. **View Published API**
   - User redirected to API detail page
   - 402-wrapped URL displayed:
     ```
     http://localhost:8787/api/proxy/{api-id}/v1/current.json
     ```
   - API now visible in marketplace
   - User can share wrapped URL

**Result:** API is live and protected by X402 payment

---

## Flow 2: Subscribing to an API

**Actor:** API Consumer (User)

**Goal:** Subscribe to an API to use it

**Steps:**

1. **Browse Marketplace**
   - User navigates to `/discover`
   - Views grid of available APIs
   - Each card shows: name, category, price, method

2. **Select API**
   - User clicks on API card
   - Redirected to `/apis/{api-id}`
   - Sees full API details:
     - Description
     - Pricing
     - Endpoint information
     - Owner address
     - Activity status

3. **Subscribe**
   - User clicks "Subscribe" button
   - Frontend checks wallet connection
   - If not connected, prompts to connect
   - Request sent to `POST /api/subscriptions`
   - Backend records subscription:
     ```json
     {
       "walletAddress": "0xUser...",
       "apiId": "api-123",
       "timestamp": 1737628800000
     }
     ```
   - Subscription saved in db.json

4. **View Wrapped URL**
   - After subscribing, wrapped URL becomes visible:
     ```
     http://localhost:8787/api/proxy/api-123/endpoint
     ```
   - User can copy URL for external use
   - Or test directly in browser

5. **Manage Subscription**
   - User can go to `/my-subscriptions`
   - Sees all active subscriptions
   - Can unsubscribe by clicking trash icon
   - Unsubscribe removes entry from db.json

**Result:** User is subscribed and can make API calls

---

## Flow 3: Executing an API Call (First Time - With Payment)

**Actor:** API Consumer (User)

**Goal:** Make first API call and authorize payment

**Steps:**

1. **Navigate to Executor**
   - From API detail page, click "Execute API"
   - Or go directly to `/execute/{api-id}`
   - API executor interface loads

2. **Prepare Request**
   - Enter request parameters (if needed)
   - Example for Weather API:
     ```json
     {
       "q": "London",
       "key": "demo-key"
     }
     ```
   - Select HTTP method (pre-filled from API config)

3. **Attempt API Call**
   - User clicks "Execute API Call"
   - Frontend calls: `POST /api/proxy/{api-id}/endpoint`
   - **No `x-payment-id` header** (first time)

4. **Receive 402 Payment Required**
   - Backend checks for entitlement
   - No valid payment ID found
   - Returns `402 Payment Required`:
     ```json
     {
       "x402Version": 1,
       "error": "payment_required",
       "accepts": [{
         "network": "cronos-testnet",
         "asset": "0x...",  // USDC address
         "amount": "1000000",  // 1 USDC in micro-units
         "recipient": "0x...",  // API owner
         "paymentId": "unique-payment-id"
       }]
     }
     ```

5. **Connect Wallet (if needed)**
   - Frontend detects 402 response
   - If wallet not connected, prompts user
   - User approves MetaMask connection

6. **Switch to Cronos Network (if needed)**
   - Frontend checks current network
   - If not Cronos, prompts network switch
   - User approves network switch in MetaMask
   - MetaMask switches to Cronos Testnet

7. **Generate Payment Authorization**
   - Frontend uses ethers.js to create EIP-3009 signature:
     ```typescript
     const domain = {
       name: 'USD Coin',
       version: '2',
       chainId: 338,  // Cronos Testnet
       verifyingContract: assetAddress
     };
     
     const types = {
       TransferWithAuthorization: [
         { name: 'from', type: 'address' },
         { name: 'to', type: 'address' },
         { name: 'value', type: 'uint256' },
         { name: 'validAfter', type: 'uint256' },
         { name: 'validBefore', type: 'uint256' },
         { name: 'nonce', type: 'bytes32' }
       ]
     };
     
     const signature = await signer._signTypedData(domain, types, values);
     ```

8. **Sign Payment**
   - MetaMask prompts user to sign message
   - **No gas fee** (off-chain signature)
   - User approves signature
   - Frontend receives signed payment

9. **Submit Payment**
   - Frontend posts to `POST /api/pay`:
     ```json
     {
       "paymentId": "unique-payment-id",
       "paymentHeader": "base64-encoded-signature",
       "paymentRequirements": { ...challenge }
     }
     ```

10. **Backend Verifies and Settles**
    - Backend verifies signature off-chain (free)
    - Backend settles payment on-chain via Facilitator:
      ```typescript
      const settlement = await facilitator.settlePayment({
        paymentHeader,
        paymentRequirements
      });
      ```
    - Transaction submitted to Cronos blockchain
    - Backend waits for confirmation
    - Backend stores payment ID as entitlement:
      ```typescript
      entitlements.set(paymentId, {
        settled: true,
        txHash: settlement.txHash,
        timestamp: Date.now()
      });
      ```

11. **Retry API Call**
    - Frontend automatically retries original request
    - Now includes `x-payment-id: unique-payment-id` header
    - Backend validates entitlement
    - Entitlement found and valid

12. **Proxy to Original API**
    - Backend forwards request to original API:
      ```
      GET https://api.weatherapi.com/v1/current.json?q=London&key=...
      ```
    - Receives response from original API
    - Returns response to frontend

13. **Display Response**
    - Frontend displays API response:
      ```json
      {
        "location": {
          "name": "London",
          "country": "United Kingdom",
          "localtime": "2026-01-23 14:30"
        },
        "current": {
          "temp_c": 12,
          "condition": {
            "text": "Partly cloudy"
          }
        }
      }
      ```
    - Success message displayed
    - Payment ID stored for future use

**Result:** API call successful, payment settled on-chain, entitlement recorded

---

## Flow 4: Executing an API Call (Subsequent - No Payment)

**Actor:** API Consumer (User with existing entitlement)

**Goal:** Make another API call without additional payment

**Steps:**

1. **Execute API Call**
   - User returns to `/execute/{api-id}`
   - Enters new request parameters
   - Clicks "Execute API Call"

2. **Send Request with Payment ID**
   - Frontend includes stored payment ID:
     ```
     POST /api/proxy/{api-id}/endpoint
     Headers: x-payment-id: unique-payment-id
     ```

3. **Backend Validates Entitlement**
   - Backend checks entitlements map
   - Finds valid payment ID
   - Confirms settlement status
   - **No additional payment required**

4. **Proxy and Return**
   - Backend forwards request to original API
   - Receives response
   - Returns response to frontend
   - User sees results immediately

**Result:** API call successful without additional payment

---

## Flow 5: Unsubscribing from an API

**Actor:** API Consumer (User)

**Goal:** Remove subscription to an API

**Steps:**

1. **Navigate to Subscriptions**
   - User goes to `/my-subscriptions`
   - Sees grid of all active subscriptions

2. **Select API to Unsubscribe**
   - Each subscription card shows:
     - API name and details
     - Subscription date
     - Delete button (trash icon)

3. **Click Unsubscribe**
   - User clicks trash icon on API card
   - Confirmation prompt may appear
   - User confirms action

4. **Remove Subscription**
   - Frontend sends: `DELETE /api/subscriptions`
     ```json
     {
       "walletAddress": "0xUser...",
       "apiId": "api-123"
     }
     ```
   - Backend removes subscription from db.json:
     ```typescript
     const index = subscriptions.findIndex(
       s => s.walletAddress === wallet && s.apiId === apiId
     );
     subscriptions.splice(index, 1);
     ```

5. **Update UI**
   - Frontend removes card from view
   - Success message displayed
   - Subscription count updates

**Result:** Subscription removed, no longer appears in dashboard

---

## Flow 6: AI Budget Guardian Monitoring

**Actor:** AI Agent (Autonomous)

**Goal:** Monitor transactions and detect anomalies

**Steps:**

1. **Agent Initialization**
   - Agent starts with: `python main.py`
   - Loads agent wallet from .env
   - Connects to Cronos blockchain
   - Initializes AI provider (OpenAI/DeepSeek)

2. **Continuous Monitoring**
   - Agent monitors blockchain for transactions
   - Specifically watches agent wallet address
   - Detects new transactions in real-time

3. **Transaction Detection**
   - New transaction appears:
     ```json
     {
       "from": "0xAgent...",
       "to": "0xAPI...",
       "value": "1000000",  // 1 USDC
       "txHash": "0x..."
     }
     ```

4. **Collect Context**
   - Agent retrieves transaction history
   - Calculates spending patterns:
     - Average transaction amount
     - Frequency per hour/day
     - Common recipients
     - Typical time windows

5. **AI Analysis**
   - Agent sends data to AI:
     ```python
     analysis = openai.chat.completions.create(
       model="gpt-4",
       messages=[{
         "role": "system",
         "content": "Analyze for anomalies"
       }, {
         "role": "user",
         "content": json.dumps(transaction_data)
       }]
     )
     ```
   - AI evaluates:
     - Amount deviation from normal
     - Frequency anomalies
     - Unusual recipients
     - Time-of-day patterns

6. **Anomaly Detection**
   - AI returns risk score (0.0 to 1.0)
   - Example: 0.95 (high risk)
   - Reasons:
     ```json
     {
       "is_anomaly": true,
       "confidence": 0.95,
       "reasons": [
         "Amount 10x higher than normal",
         "100 transactions in 5 minutes",
         "New recipient address"
       ],
       "should_pause": true
     }
     ```

7. **Alert Generation**
   - Agent creates alert:
     ```json
     {
       "severity": "high",
       "message": "Unusual spending detected",
       "amount": "50.0",
       "timestamp": "2026-01-23T14:30:00",
       "action_taken": "auto_paused"
     }
     ```
   - Alert stored in database
   - Notification sent to user (if configured)

8. **Auto-Pause (if risk > 0.9)**
   - Agent pauses future transactions
   - Sets flag in database
   - Prevents additional spending
   - Waits for user confirmation

9. **User Review**
   - User checks `/guardian` dashboard
   - Sees alert with details
   - Reviews transaction history
   - Can approve or block

10. **Resume or Block**
    - If legitimate: User approves
    - Agent resumes normal operation
    - If fraud: User blocks permanently
    - Agent blacklists recipient

**Result:** Suspicious activity detected and prevented, user funds protected

---

## Flow 7: Testing with Test Client

**Actor:** Developer

**Goal:** Test 402-wrapped URL independently

**Steps:**

1. **Get Wrapped URL**
   - From main app, copy wrapped URL:
     ```
     http://localhost:8787/api/proxy/api-123/endpoint
     ```

2. **Open Test Client**
   - Navigate to http://localhost:5173
   - Minimal UI with URL input

3. **Enter URL**
   - Paste wrapped URL into input field
   - Click "Call API"

4. **Receive 402**
   - Test client displays 402 challenge
   - Shows payment requirements

5. **Connect and Pay**
   - Click "Connect Wallet"
   - Sign payment authorization
   - Payment settles

6. **View Response**
   - Test client retries automatically
   - Displays API response
   - Shows payment ID for future use

**Result:** Wrapped URL validated independently

---

## Key Takeaways for Judges

1. **No API Keys**: Everything is wallet-based
2. **Pay-per-call**: Only pay when they(User/IAgent) use APIs
3. **On-chain Settlement**: All payments verifiable on blockchain
4. **Instant Access**: After payment, immediate API access
5. **Reusable Entitlements**: One payment enables multiple calls
6. **AI Protection**: Autonomous agent monitors spending
7. **Transparent**: All transactions visible on Cronos explorer