import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import './Navbar.css';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
}

const shortAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { account, selectedNetwork, walletBusy, walletMessage, connectWallet, switchNetwork } = useWallet();

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
