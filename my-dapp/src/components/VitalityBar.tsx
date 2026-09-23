import React from 'react';
import './VitalityBar.css';

export const VitalityBar: React.FC = () => {
  return (
    <div className="vitality-bar-wrap">
      <div className="container vitality-inner">
        <div className="vitality-track">
          {/* Status Indicator */}
          <div className="vitality-badge safe">
            <span className="vitality-pulse"></span>
            <span className="vitality-text">100% Full-Reserve Collateral Backing</span>
          </div>

          <div className="vitality-divider">/</div>

          {/* Network Badges */}
          <div className="vitality-item">
            <span className="vitality-label">Networks:</span>
            <span className="vitality-val">Arbitrum Sepolia & Robinhood Chain</span>
          </div>

          <div className="vitality-divider">/</div>

          {/* Stylus Engine Status */}
          <div className="vitality-item">
            <span className="vitality-label">Risk Engine:</span>
            <span className="vitality-tag-stylus">Arbitrum Stylus (Rust WASM)</span>
          </div>

          <div className="vitality-divider">/</div>

          {/* Quick Metrics */}
          <div className="vitality-metrics-group">
            <div className="metric-pill">
              <span className="m-label">Total Vault Collateral:</span>
              <span className="m-value">$1,250,000 USDC</span>
            </div>
            <div className="metric-pill">
              <span className="m-label">Active Coverage:</span>
              <span className="m-value">$480,000 USDC</span>
            </div>
            <div className="metric-pill">
              <span className="m-label">Claims Settled:</span>
              <span className="m-value text-emerald">$32,500 USDC</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
