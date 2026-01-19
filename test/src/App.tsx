import { useState } from 'react';
import { Facilitator } from '@crypto.com/facilitator-client';
import { ensureWallet } from './utils/wallet';
import { ensureCronosChain } from './utils/cronos';

interface X402Response {
  x402Version: number;
  error: string;
  accepts: Array<{
    scheme: string;
    network: any;
    payTo: string;
    maxAmountRequired: string;
    asset: any;
    maxTimeoutSeconds: number;
    extra: {
      paymentId: string;
    };
  }>;
}

function App() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExecute = async () => {
    if (!url) return;
    
    setLoading(true);
    setStatus('Fetching URL...');
    setError(null);
    setResult(null);

    try {
      // 1. Try to call the API
      // Note: We expect status 402 if payment is required.
      // If CORS is configured correctly on backend (allowing localhost:5173),
      // we can read the body even on 402.
      let response = await fetch(url);

      if (response.status === 402) {
        setStatus('402 Payment Required. Analyzing challenge...');
        
        let challenge: X402Response;
        try {
            challenge = await response.json();
        } catch(e) {
            console.error(e);
            throw new Error('Received 402 but could not parse JSON challenge');
        }
        
        if (!challenge.accepts || challenge.accepts.length === 0) {
          throw new Error('Invalid X402 challenge: No accepts found');
        }

        const details = challenge.accepts[0];
        const paymentId = details.extra?.paymentId;
        if (!paymentId) throw new Error('No paymentID in challenge');

        // 2. Connect Wallet
        setStatus('Connecting wallet...');
        const provider = await ensureWallet();
        
        // 3. Ensure correct network
        setStatus(`Switching to ${details.network}...`);
        await ensureCronosChain(details.network);

        const signer = await provider.getSigner();
        
        // 4. Generate Payment
        setStatus(`Generating payment for ${paymentId}...`);
        const fac = new Facilitator({ network: details.network });
        
        const paymentHeader = await fac.generatePaymentHeader({
          to: details.payTo,
          value: details.maxAmountRequired,
          asset: details.asset,
          signer,
          validBefore: Math.floor(Date.now() / 1000) + details.maxTimeoutSeconds,
          validAfter: 0,
        });

        // 5. Settle Payment
        let payUrl = '';
        try {
            // Heuristic logic to find payment endpoint
            if (url.includes('/proxy/')) {
                const parts = url.split('/proxy/');
                payUrl = parts[0] + '/pay';
            } else {
                 const urlObj = new URL(url);
                 payUrl = `${urlObj.origin}/api/pay`;
            }
        } catch (e) {
           throw new Error('Could not determine pay URL');
        }

        setStatus(`Settling payment to ${payUrl}...`);
        
        const payResponse = await fetch(payUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentId,
            paymentHeader,
            paymentRequirements: details
          })
        });

        if (!payResponse.ok) {
           const errText = await payResponse.text();
           throw new Error(`Payment settlement failed: ${payResponse.status} ${errText}`);
        }

        const payData = await payResponse.json();
        if(payData.ok === false) {
           throw new Error(`Payment error: ${JSON.stringify(payData)}`);
        }

        setStatus(`Payment settled. Retrying API call...`);
        
        // 6. Retry with header
        response = await fetch(url, {
           headers: {
             'x-payment-id': paymentId
           }
        });
      }

      const contentType = response.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      setResult(data);
      setStatus(`Success! Status: ${response.status}`);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unknown error');
      setStatus('Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>X402 API Tester</h1>
      
      <div className="form-group">
        <label htmlFor="url-input">API URL (Masked)</label>
        <input
          id="url-input"
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="http://localhost:3000/api/proxy/..."
          disabled={loading}
        />
      </div>

      <button onClick={handleExecute} disabled={loading || !url}>
        {loading ? 'Processing...' : 'Execute API Call'}
      </button>

      {status && (
        <div className={`status ${error ? 'error' : 'success'}`}>
          {error ? `Error: ${error}` : status}
        </div>
      )}

      {result && (
         <div style={{ marginTop: '20px' }}>
            <label>Response:</label>
            <pre>
            {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
            </pre>
         </div>
      )}
    </div>
  );
}

export default App;

