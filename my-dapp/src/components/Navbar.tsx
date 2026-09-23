import React, { useState } from 'react';
import './Navbar.css';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState('Arbitrum Sepolia');
  const [walletConnected, setWalletConnected] = useState(false);

  const toggleWallet = () => {
    setWalletConnected(!walletConnected);
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
        <nav className="navbar-pill-nav">
          {navLinks.map((link) => (
            <button
              key={link.id}
              className={`nav-pill-btn ${currentTab === link.id ? 'active' : ''}`}
              onClick={() => {
                onNavigate(link.id);
                setMobileMenuOpen(false);
              }}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right Controls: Network Switcher + Wallet */}
        <div className="navbar-actions">
          {/* Network Selector */}
          <div className="network-selector-wrap">
            <span className="network-dot"></span>
            <select
              aria-label="Blockchain Network"
              value={selectedNetwork}
              onChange={(e) => setSelectedNetwork(e.target.value)}
              className="network-select"
            >
              <option value="Arbitrum Sepolia">Arbitrum Sepolia (421614)</option>
              <option value="Robinhood Chain">Robinhood Chain (4663)</option>
              <option value="Arbitrum One">Arbitrum One (Mainnet)</option>
            </select>
          </div>

          {/* Connect Wallet Button */}
          <button 
            className={`btn-wallet ${walletConnected ? 'connected' : ''}`}
            onClick={toggleWallet}
          >
            {walletConnected ? (
              <>
                <span className="wallet-dot"></span>
                <span>0x7F2...8b14</span>
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                  <path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z" />
                  <circle cx="16" cy="14" r="1" />
                </svg>
                <span>Connect Wallet</span>
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
          <nav className="mobile-nav-list">
            {navLinks.map((link) => (
              <button
                key={link.id}
                className={`mobile-nav-item ${currentTab === link.id ? 'active' : ''}`}
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
              onClick={toggleWallet}
            >
              {walletConnected ? 'Connected: 0x7F2...8b14' : 'Connect Wallet'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
