import React from 'react';
import './Footer.css';

export const Footer: React.FC = () => {
  return (
    <footer className="protocol-footer">
      <div className="container">
        <div className="footer-top">
          {/* Brand Col */}
          <div className="footer-brand-col">
            <div className="footer-brand">
              <img src="/rbdshieldlogo.jpeg" alt="RBD Shield" className="footer-logo-img" />
              <span className="footer-brand-title">RBD SHIELD</span>
            </div>
            <p className="footer-tagline">
              Autonomous Risk-Underwriting & Parametric Performance-Bond Protocol for AI Agents.
            </p>
            <div className="footer-badges">
              <span className="footer-badge">Arbitrum Open House SG</span>
              <span className="footer-badge">Robinhood Chain (4663)</span>
              <span className="footer-badge">Stylus SDK 0.10.9</span>
            </div>
          </div>

          {/* Links Cols */}
          <div className="footer-links-grid">
            <div className="link-group">
              <h4 className="group-title">Protocol Core</h4>
              <ul className="links-list">
                <li><a href="#how-it-works">How It Works</a></li>
                <li><a href="#calculator">Bond Calculator</a></li>
                <li><a href="#architecture">Stylus Risk Engine</a></li>
                <li><a href="#featured">Featured Agents</a></li>
              </ul>
            </div>

            <div className="link-group">
              <h4 className="group-title">Smart Contracts</h4>
              <ul className="links-list font-mono">
                <li><span className="contract-tag">VaultManager</span></li>
                <li><span className="contract-tag">CoverageManager</span></li>
                <li><span className="contract-tag">AgentRegistry</span></li>
                <li><span className="contract-tag">ClaimsProcessor</span></li>
                <li><span className="contract-tag">RiskEngine (Rust WASM)</span></li>
              </ul>
            </div>

            <div className="link-group">
              <h4 className="group-title">Verification & Security</h4>
              <ul className="links-list">
                <li><span>Full Invariant: 100% Solvency</span></li>
                <li><span>Double-Spend Protected</span></li>
                <li><span>ReentrancyGuard Enforced</span></li>
                <li><span>Zero Fractional Risk</span></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copy">
            © 2026 RBD Shield Protocol. Built for verifiable autonomous agent accountability.
          </div>
          <div className="footer-legal">
            <span>Parametric performance bonds are deterministic on-chain contracts and do not constitute traditional indemnity insurance.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
