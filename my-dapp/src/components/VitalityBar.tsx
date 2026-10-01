import React from 'react';
import './VitalityBar.css';

export const VitalityBar: React.FC = () => {
  return (
    <div className="vitality-bar-wrap">
      <div className="container vitality-inner">
        <div className="vitality-track">
          <div className="vitality-badge safe">
            <span className="vitality-pulse"></span>
            <span className="vitality-text">100% Full-Reserve Collateral</span>
          </div>

          <div className="vitality-item compact">
            <span className="vitality-label">Networks:</span>
            <span className="vitality-val">Arbitrum Sepolia + Robinhood</span>
          </div>

          <div className="vitality-item compact">
            <span className="vitality-label">Risk Engine:</span>
            <span className="vitality-tag-stylus">Stylus (Rust WASM)</span>
          </div>

          <div className="vitality-item compact stats-pill">
            <span className="vitality-label">Vault:</span>
            <span className="vitality-val">$1.25M / $480k / $32.5k</span>
          </div>
        </div>
      </div>
    </div>
  );
};
