import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
};

type WalletContextValue = {
  account: string | null;
  selectedNetwork: string;
  walletBusy: boolean;
  walletMessage: string | null;
  demoMode: boolean;
  connectWallet: () => Promise<void>;
  switchNetwork: (network: string) => Promise<void>;
  setDemoMode: (enabled: boolean) => void;
};

const networks = [
  { label: 'Arbitrum Sepolia', chainId: '0x66eee' },
  { label: 'Robinhood Chain', chainId: '0x1237' },
  { label: 'Arbitrum One', chainId: '0xa4b1' },
];

const WalletContext = createContext<WalletContextValue | null>(null);
const getProvider = () => (window as Window & { ethereum?: EthereumProvider }).ethereum;

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState('Arbitrum Sepolia');
  const [walletBusy, setWalletBusy] = useState(false);
  const [walletMessage, setWalletMessage] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    const provider = getProvider();
    if (!provider) return;
    const syncAccounts = (accounts: unknown) => setAccount(Array.isArray(accounts) && typeof accounts[0] === 'string' ? accounts[0] : null);
    const syncChain = (chainId: unknown) => {
      const network = networks.find((item) => item.chainId === chainId);
      if (network) setSelectedNetwork(network.label);
    };
    provider.request({ method: 'eth_accounts' }).then(syncAccounts).catch(() => undefined);
    provider.request({ method: 'eth_chainId' }).then(syncChain).catch(() => undefined);
    provider.on?.('accountsChanged', syncAccounts);
    provider.on?.('chainChanged', syncChain);
    return () => {
      provider.removeListener?.('accountsChanged', syncAccounts);
      provider.removeListener?.('chainChanged', syncChain);
    };
  }, []);

  const connectWallet = async () => {
    const provider = getProvider();
    if (!provider) {
      setWalletMessage('No browser wallet found. Install or unlock a wallet extension, then try again.');
      return;
    }
    if (account) {
      setAccount(null);
      setWalletMessage('Wallet disconnected from this app.');
      return;
    }
    setWalletBusy(true);
    setWalletMessage(null);
    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      const nextAccount = Array.isArray(accounts) && typeof accounts[0] === 'string' ? accounts[0] : null;
      if (!nextAccount) throw new Error('No wallet account was returned.');
      setAccount(nextAccount);
      setDemoMode(false);
      setWalletMessage(`Connected as ${nextAccount.slice(0, 6)}...${nextAccount.slice(-4)}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Wallet connection was not approved.';
      setWalletMessage(message.includes('denied') || message.includes('rejected') ? 'Wallet connection was rejected.' : message);
    } finally {
      setWalletBusy(false);
    }
  };

  const switchNetwork = async (label: string) => {
    setSelectedNetwork(label);
    const provider = getProvider();
    const network = networks.find((item) => item.label === label)!;
    if (!account || !provider) return;
    setWalletBusy(true);
    setWalletMessage(null);
    try {
      await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: network.chainId }] });
      setWalletMessage(`Switched wallet to ${network.label}.`);
    } catch (error) {
      const code = typeof error === 'object' && error !== null && 'code' in error ? (error as { code?: number }).code : undefined;
      setWalletMessage(code === 4902 ? `${network.label} is not configured in your wallet yet.` : 'Could not switch the active wallet network.');
    } finally {
      setWalletBusy(false);
    }
  };

  const value = { account, selectedNetwork, walletBusy, walletMessage, demoMode, connectWallet, switchNetwork, setDemoMode };
  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useWallet = () => {
  const wallet = useContext(WalletContext);
  if (!wallet) throw new Error('useWallet must be used inside WalletProvider.');
  return wallet;
};
