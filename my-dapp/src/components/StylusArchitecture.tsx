import React from 'react';
import { useReveal } from '../hooks/useReveal';
import './StylusArchitecture.css';

export const StylusArchitecture: React.FC = () => {
  const sectionRef = useReveal();
  return (
    <section className="stylus-section" id="architecture" ref={sectionRef as React.RefObject<HTMLElement>}>
      <div className="container">
        <div className="stylus-card glass-panel">
          <div className="stylus-grid">
            {/* Left Column: Why Stylus */}
            <div className="stylus-left reveal">
              <div className="stylus-chip">
                <span className="stylus-chip-dot"></span>
                <span>ARBITRUM STYLUS + ROBINHOOD CHAIN</span>
              </div>

              <h2 className="stylus-title">
                Actuarial Math at WASM Speed, Settled on Arbitrum
              </h2>

              <p className="stylus-body">
                Traditional EVM contracts struggle with compute-heavy fixed-point mathematics, 
                multi-factor volatility ratios, and continuous risk pricing without prohibitive gas costs.
              </p>

              <div className="stylus-highlights">
                <div className="highlight-item">
                  <div className="h-num text-cyan">10–50x</div>
                  <div className="h-text">
                    <strong>Lower Gas Execution</strong>
                    <span>Rust compiled to WASM executes raw actuarial formulas with minimal overhead.</span>
                  </div>
                </div>

                <div className="highlight-item">
                  <div className="h-num text-emerald">0.8.37 + 0.10.9</div>
                  <div className="h-text">
                    <strong>Seamless Hybrid Interop</strong>
                    <span>The app and integration clients read the deployed Rust `RiskEngine` via its EVM ABI; vault custody and payouts remain independent of score availability.</span>
                  </div>
                </div>

                <div className="highlight-item">
                  <div className="h-num text-cyan">Chain 4663</div>
                  <div className="h-text">
                    <strong>Robinhood Chain Ready</strong>
                    <span>Built for autonomous agent trading on Arbitrum One, Arbitrum Sepolia, and Robinhood Chain.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Code & Weights Comparison */}
            <div className="stylus-right glass-panel reveal reveal-delay-2">
              <div className="code-header">
                <div className="window-dots">
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
                </div>
                <span className="code-filename font-mono">stylus-risk-engine/src/lib.rs</span>
                <span className="code-badge">Rust WASM</span>
              </div>

              <div className="code-snippet font-mono">
                <pre>
{`// Deterministic Multi-Factor Risk Calculation
#[public]
impl RiskEngine {
    pub fn calculate_risk_score(
        &self,
        uptime_bps: U256,
        volatility_bps: U256,
        utilization_bps: U256,
        claim_history_bps: U256
    ) -> U256 {
        // Fixed-point weighted actuarial scoring
        let score = (uptime_bps * self.weight_uptime.get()
            + volatility_bps * self.weight_volatility.get()
            + utilization_bps * self.weight_utilization.get()
            + claim_history_bps * self.weight_claims.get())
            / WEIGHT_DENOMINATOR;
            
        score.min(MAX_SCORE)
    }
}`}
                </pre>
              </div>

              <div className="weights-bar-summary">
                <div className="w-label font-mono">Stylus Scoring Weights:</div>
                <div className="weights-meter">
                  <div className="w-segment w-uptime" title="Uptime: 30%">30% Uptime</div>
                  <div className="w-segment w-vol" title="Volatility: 25%">25% Volatility</div>
                  <div className="w-segment w-util" title="Utilization: 25%">25% Utilization</div>
                  <div className="w-segment w-claims" title="Claims: 20%">20% Claims</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
