import React, { useEffect, useState } from 'react';
import './Navbar.css';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
}

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
};

type Network = {
  label: string;
  chainId: string;
};

const networks: Network[] = [
  { label: 'Arbitrum Sepolia', chainId: '0x66eee' },
  { label: 'Robinhood Chain', chainId: '0x1237' },
  { label: 'Arbitrum One', chainId: '0xa4b1' },
];

const getProvider = () => (window as Window & { ethereum?: EthereumProvider }).ethereum;
const shortAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState('Arbitrum Sepolia');
  const [account, setAccount] = useState<string | null>(null);
  const [walletBusy, setWalletBusy] = useState(false);
  const [walletMessage, setWalletMessage] = useState<string | null>(null);

  useEffect(() => {
    const provider = getProvider();
    if (!provider) return;

    const syncAccounts = (accounts: unknown) => {
      const nextAccount = Array.isArray(accounts) && typeof accounts[0] === 'string' ? accounts[0] : null;
      setAccount(nextAccount);
    };
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
      setWalletMessage(`Connected as ${shortAddress(nextAccount)}.`);
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

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'directory', label: 'Agent Directory' },
    { id: 'coverage', label: 'My Coverage' },
    { id: 'claims', label: 'Claims' },
    { id: 'analytics', label: 'Analytics' },
  ];

  return (
    <header className="navbar-header">
      <div className="container navbar-inner">
        {/* Brand Lock-up */}
        <div className="navbar-brand" onClick={() => onNavigate('home')}>
          <div className="brand-logo-glow">
            <img src="/rbdshieldlogo.jpeg" alt="RBD Shield Logo" className="brand-logo-img" />
          </div>
          <div className="brand-text-group">
            <span className="brand-title">RBD SHIELD</span>
            <span className="brand-tag">STYLUS VERIFIED</span>
          </div>
        </div>

        {/* Desktop Pill Navigation */}
        <nav className="navbar-pill-nav" aria-label="Main navigation">
          {navLinks.map((link) => {
            const isActive = currentTab === link.id || (link.id === 'directory' && currentTab === 'agent-detail');
            return (
              <button
                key={link.id}
                className={`nav-pill-btn ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => {
                  onNavigate(link.id);
                  setMobileMenuOpen(false);
                }}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right Controls: Network Switcher + Wallet */}
        <div className="navbar-actions">
          {/* Network Selector */}
          <div className="network-selector-wrap">
            <span className="network-dot"></span>
            <select
              aria-label="Blockchain Network"
              value={selectedNetwork}
              onChange={(e) => switchNetwork(e.target.value)}
              className="network-select"
            >
              <option value="Arbitrum Sepolia">Arbitrum Sepolia (421614)</option>
              <option value="Robinhood Chain">Robinhood Chain (4663)</option>
              <option value="Arbitrum One">Arbitrum One (Mainnet)</option>
            </select>
          </div>

          {/* Connect Wallet Button */}
          <button 
            className={`btn-wallet ${account ? 'connected' : ''}`}
            onClick={connectWallet}
            disabled={walletBusy}
            aria-busy={walletBusy}
          >
            {account ? (
              <>
                <span className="wallet-dot"></span>
                <span>{shortAddress(account)}</span>
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                  <path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z" />
                  <circle cx="16" cy="14" r="1" />
                </svg>
                <span>{walletBusy ? 'Connecting...' : 'Connect Wallet'}</span>
              </>
            )}
          </button>

          {/* Mobile Hamburger Button */}
          <button
            aria-label="Toggle Navigation Menu"
            className="mobile-hamburger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className={`hamburger-bar ${mobileMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-bar ${mobileMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-bar ${mobileMenuOpen ? 'open' : ''}`}></span>
          </button>
        </div>
      </div>

      {/* Mobile Slide-Out Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <nav className="mobile-nav-list" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <button
                key={link.id}
                className={`mobile-nav-item ${currentTab === link.id ? 'active' : ''}`}
                aria-current={currentTab === link.id ? 'page' : undefined}
                onClick={() => {
                  onNavigate(link.id);
                  setMobileMenuOpen(false);
                }}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="mobile-drawer-footer">
            <div className="mobile-network-info">
              <span className="network-dot"></span>
              <span>Network: {selectedNetwork}</span>
            </div>
            <button 
            className="btn-wallet mobile-wallet-btn"
              onClick={connectWallet}
              disabled={walletBusy}
            >
              {account ? `Connected: ${shortAddress(account)}` : walletBusy ? 'Connecting...' : 'Connect Wallet'}
            </button>
          </div>
        </div>
      )}
      {walletMessage && <div className="wallet-feedback" role="status">{walletMessage}</div>}
    </header>
  );
};
