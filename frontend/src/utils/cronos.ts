import type { CronosNetwork } from '@crypto.com/facilitator-client';

/**
 * Cronos network configurations
 */
const CRONOS_NETWORKS = {
  'cronos-testnet': {
    chainId: '0x152', // 338 in hex
    chainName: 'Cronos Testnet',
    rpcUrls: ['https://evm-t3.cronos.org'],
    nativeCurrency: {
      name: 'CRO',
      symbol: 'CRO',
      decimals: 18,
    },
    blockExplorerUrls: ['https://explorer.cronos.org/testnet'],
  },
  'cronos-mainnet': {
    chainId: '0x19', // 25 in hex
    chainName: 'Cronos Mainnet',
    rpcUrls: ['https://evm.cronos.org'],
    nativeCurrency: {
      name: 'CRO',
      symbol: 'CRO',
      decimals: 18,
    },
    blockExplorerUrls: ['https://explorer.cronos.org'],
  },
};

/**
 * Ensures the wallet is connected to the correct Cronos network.
 * Attempts to switch networks if on the wrong one.
 */
export async function ensureCronosChain(network: CronosNetwork): Promise<void> {
  if (!window.ethereum) {
    throw new Error('No wallet detected');
  }

  const config = CRONOS_NETWORKS[network];
  if (!config) {
    throw new Error(`Unknown network: ${network}`);
  }

  try {
    // Try to switch to the network
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: config.chainId }],
    });
  } catch (error: any) {
    // If network not added, add it
    if (error.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [config],
      });
    } else {
      throw error;
    }
  }
}

/**
 * Gets the current chain ID from the wallet.
 */
export async function getCurrentChainId(): Promise<string> {
  if (!window.ethereum) {
    throw new Error('No wallet detected');
  }

  const chainId = await window.ethereum.request({
    method: 'eth_chainId',
  }) as string;

  return chainId;
}
