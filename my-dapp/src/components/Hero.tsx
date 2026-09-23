import React from 'react';
import './Hero.css';

interface HeroProps {
  onExploreAgents: () => void;
  onHowItWorks: () => void;
  onOpenRegisterModal: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onExploreAgents,
  onHowItWorks,
  onOpenRegisterModal,
}) => {
  return (
    <section className="hero-section">
      <div className="container hero-inner">
        {/* Left Column: Copy & Actions */}
        <div className="hero-content">
          <div className="hero-eyebrow">
            <span className="eyebrow-dot"></span>
            <span>Collateral-Backed Accountability for Autonomous AI Agents</span>
          </div>

          <h1 className="hero-headline">
            Trust AI agents with <span className="text-gradient">proof</span>, not promises.
          </h1>

          <p className="hero-description">
            The decentralized performance-bond protocol for autonomous AI agents. 
            Agents stake on-chain collateral into bonded vaults to guarantee their execution—unlocking 
            instant, parametric payouts when service terms fail.
          </p>

          <div className="hero-cta-group">
            <button className="btn-primary-cyan" onClick={onExploreAgents}>
              <span>Explore Agents & Coverage</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>

            <button className="btn-secondary-ghost" onClick={onHowItWorks}>
              <span className="play-icon-wrap">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </span>
              <span>How It Works & Video Guide</span>
            </button>
          </div>

          {/* Supply-side Agent Developer Invitation */}
          <div className="hero-developer-prompt">
            <span className="dev-tag">FOR AGENT DEVELOPERS</span>
            <span className="dev-text">Building an autonomous bot or DeFi agent?</span>
            <button className="dev-link-btn" onClick={onOpenRegisterModal}>
              Stake a bond & register your agent →
            </button>
          </div>
        </div>

        {/* Right Column: Visual Shield Emblem & Ambient Cards */}
        <div className="hero-visual-wrap">
          <div className="hero-ambient-glow"></div>
          
          <div className="hero-shield-card glass-panel">
            <div className="shield-image-container">
              <img 
                src="/rbdshieldlogo.jpeg" 
                alt="RBD Shield Sovereign Emblem" 
                className="shield-hero-img" 
              />
              <div className="shield-radial-overlay"></div>
            </div>

            <div className="shield-card-details">
              <div className="shield-status-line">
                <span className="badge-shield-live">● ON-CHAIN BONDED VAULT</span>
                <span className="badge-chain">ARBITRUM ORBIT</span>
              </div>
              <h3 className="shield-card-title">RBD Shield Parametric Rail</h3>
              <p className="shield-card-subtitle">Full-Reserve Risk Underwriting & Autonomous SLA Guarantee</p>
            </div>

            {/* Floating Floating Badges */}
            <div className="floating-badge badge-top-left glass-panel">
              <span className="float-icon">🛡️</span>
              <div>
                <div className="float-title">100% Solvency</div>
                <div className="float-sub">Full 1:1 Collateral Reserve</div>
              </div>
            </div>

            <div className="floating-badge badge-bottom-right glass-panel">
              <span className="float-icon">⚡</span>
              <div>
                <div className="float-title">Stylus Rust WASM</div>
                <div className="float-sub">Real-Time Deterministic Math</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
