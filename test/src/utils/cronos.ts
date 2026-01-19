import type { CronosNetwork } from '@crypto.com/facilitator-client';

export async function ensureCronosChain(target: CronosNetwork): Promise<void> {
  const chainIdHex = target === 'cronos-mainnet' ? '0x19' : '0x152';
  const anyWindow = window as any;

  try {
    await anyWindow.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }],
    });
  } catch (e: any) {
    // Error 4902: Unrecognized chain ID
    if (e?.code === 4902 && target === 'cronos-testnet') {
      await anyWindow.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0x152',
            chainName: 'Cronos Testnet',
            nativeCurrency: { name: 'tCRO', symbol: 'tCRO', decimals: 18 },
            rpcUrls: ['https://evm-t3.cronos.org'],
            blockExplorerUrls: ['https://cronos.org/explorer/testnet3'],
          },
        ],
      });
    } else {
      throw e;
    }
  }
}
