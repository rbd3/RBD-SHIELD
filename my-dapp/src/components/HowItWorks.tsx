import React, { useState } from 'react';
import './HowItWorks.css';

export const HowItWorks: React.FC = () => {
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  const steps = [
    {
      num: '01',
      title: 'Agent Stakes Collateral into Vault',
      description: 'Autonomous AI agents deposit real assets (USDC) into VaultManager.sol. Collateral is segregated and locked 1:1 against issued service level agreements.',
      badge: 'Solvency Guarantee',
      icon: '🔐'
    },
    {
      num: '02',
      title: 'Users Select Verifiable Coverage',
      description: 'Users choose an SLA protection term with a fixed premium, known duration, and transparent maximum payout. Coverage is minted on-chain via CoverageManager.sol.',
      badge: 'Transparent Terms',
      icon: '📋'
    },
    {
      num: '03',
      title: 'Parametric Automated Settlement',
      description: 'When an eligible SLA failure condition is verified, ClaimsProcessor.sol releases locked collateral from the bonded vault directly to the user—no delays, no claims adjusters.',
      badge: 'Zero Human Delays',
      icon: '⚡'
    }
  ];

  return (
    <section className="how-it-works-section" id="how-it-works">
      <div className="container">
        <div className="how-header text-center">
          <div className="how-badge">
            <span>PROTOCOL ARCHITECTURE</span>
          </div>
          <h2 className="how-title">Protection with Clear, Deterministic Rules</h2>
          <p className="how-subtitle">
            Traditional insurance relies on paperwork and opaque adjusters. RBD Shield introduces full-reserve on-chain performance bonds.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="steps-grid">
          {steps.map((step) => (
            <div key={step.num} className="step-card glass-panel">
              <div className="step-card-top">
                <span className="step-num font-mono">{step.num}</span>
                <span className="step-icon">{step.icon}</span>
              </div>
              <div className="step-badge">{step.badge}</div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.description}</p>
            </div>
          ))}
        </div>

        {/* Video Guide Banner */}
        <div className="video-guide-banner glass-panel">
          <div className="video-banner-left">
            <div className="video-tag">GUIDED WALKTHROUGH</div>
            <h3 className="video-banner-title">Watch the 2-Minute Architecture & Live Demo</h3>
            <p className="video-banner-desc">
              See the complete lifecycle: Agent deposits collateral ➔ User purchases SLA bond ➔ Stylus computes risk ➔ Parametric payout settles on Arbitrum.
            </p>
          </div>

          <div className="video-banner-right">
            <button className="btn-watch-video" onClick={() => setVideoModalOpen(true)}>
              <div className="watch-play-circle">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
              <span>Watch Video Walkthrough</span>
            </button>
          </div>
        </div>
      </div>

      {/* Video Modal Placeholder */}
      {videoModalOpen && (
        <div className="video-modal-backdrop" onClick={() => setVideoModalOpen(false)}>
          <div className="video-modal-card glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4 className="modal-title">RBD Shield — Guided Walkthrough Video</h4>
              <button className="modal-close-btn" onClick={() => setVideoModalOpen(false)}>✕</button>
            </div>
            <div className="video-player-container">
              <div className="video-placeholder-inner">
                <div className="v-play-large">▶</div>
                <div className="v-placeholder-title">RBD Shield Interactive Walkthrough</div>
                <div className="v-placeholder-sub">
                  Video integration placeholder ready for your Loom / YouTube demo video embed.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
