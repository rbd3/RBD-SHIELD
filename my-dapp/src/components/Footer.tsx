import React from 'react';
import type { AgentData } from '../data/mockAgents';
import './Footer.css';

type FooterProps = {
  featuredAgent?: AgentData;
  onNavigate?: (tab: string, agent?: AgentData, section?: 'how-it-works' | 'calculator') => void;
};

export const Footer: React.FC<FooterProps> = ({ featuredAgent, onNavigate }) => {
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
          </div>

          {/* Links Cols */}
          <div className="footer-links-grid">
            <div className="link-group">
              <h4 className="group-title">Protocol Core</h4>
              <ul className="links-list">
                <li>
                  <button
                    type="button"
                    className="footer-link-button"
                    onClick={() => onNavigate?.('home', undefined, 'how-it-works')}
                  >
                    How It Works
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="footer-link-button"
                    onClick={() => onNavigate?.('home', undefined, 'calculator')}
                  >
                    Bond Calculator
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="footer-link-button"
                    onClick={() => onNavigate?.('directory', featuredAgent)}
                  >
                    Featured Agents
                  </button>
                </li>
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
