import { BrowserProvider } from 'ethers';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}

/**
 * Ensures MetaMask or compatible wallet is connected.
 * @returns BrowserProvider instance
 */
export async function ensureWallet(): Promise<BrowserProvider> {
  if (!window.ethereum) {
    throw new Error('No wallet detected. Please install MetaMask.');
  }

  await window.ethereum.request({
    method: 'eth_requestAccounts',
  });

  return new BrowserProvider(window.ethereum);
}

/**
 * Gets the current connected wallet address.
 */
export async function getWalletAddress(): Promise<string> {
  const provider = await ensureWallet();
  const signer = await provider.getSigner();
  return signer.getAddress();
}

/**
 * Checks if wallet is connected.
 */
export async function isWalletConnected(): Promise<boolean> {
  if (!window.ethereum) return false;
  
  try {
    const accounts = await window.ethereum.request({
      method: 'eth_accounts',
    }) as string[];
    return accounts.length > 0;
  } catch {
    return false;
  }
}
