import { BrowserProvider } from 'ethers';

export async function ensureWallet(): Promise<BrowserProvider> {
  const anyWindow = window as any;
  if (!anyWindow.ethereum) {
    throw new Error('No wallet detected. Please install MetaMask.');
  }

  await anyWindow.ethereum.request({
    method: 'eth_requestAccounts',
  });

  return new BrowserProvider(anyWindow.ethereum);
}
