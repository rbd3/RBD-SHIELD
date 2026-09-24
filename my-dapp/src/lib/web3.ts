import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { arbitrumSepolia } from 'wagmi/chains';
import type { Chain } from 'viem';

export const robinhoodTestnet: Chain = {
  id: 46630,
  name: 'Robinhood Chain Testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: [import.meta.env.VITE_ROBINHOOD_TESTNET_RPC_URL || 'https://rpc.testnet.robinhoodchain.com'] },
  },
  blockExplorers: {
    default: { name: 'Robinhood Explorer', url: import.meta.env.VITE_ROBINHOOD_TESTNET_EXPLORER_URL || 'https://explorer.testnet.robinhoodchain.com' },
  },
  testnet: true,
};

export const supportedChains = [arbitrumSepolia, robinhoodTestnet] as const;

export const wagmiConfig = getDefaultConfig({
  appName: 'RBD Shield',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'rbd-shield-local-development',
  chains: supportedChains,
  ssr: false,
});

export const chainForName = (name: string) =>
  name === 'Robinhood Chain' ? robinhoodTestnet : arbitrumSepolia;
