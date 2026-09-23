import React, { useState } from 'react';
import './BondCalculator.css';

interface BondCalculatorProps {
  onSelectCalculatedTerm?: (coverageAmount: number, premium: number, days: number) => void;
}

export const BondCalculator: React.FC<BondCalculatorProps> = ({ onSelectCalculatedTerm }) => {
  const [collateralStaked, setCollateralStaked] = useState<number>(25000); // $5,000 to $100,000
  const [desiredCoverage, setDesiredCoverage] = useState<number>(2500); // up to collateralStaked
  const [durationDays, setDurationDays] = useState<number>(30); // 7, 14, 30, 60, 90
  const [agentRiskFactor] = useState<number>(920); // 0-1000 Stylus score (higher = safer)

  // Math simulation matching CoverageManager & Stylus formulas:
  // Capacity: Max total active coverage = collateralStaked (100% full-reserve invariant)
  const availableCapacity = collateralStaked;
  
  // Base annualized rate = 6% adjusted by Stylus risk score (score 1000 = 4%, score 500 = 12%)
  const riskMultiplier = (1100 - agentRiskFactor) / 600; // e.g., (1100 - 920)/600 = 0.30
  const annualRate = Math.max(0.04, 0.08 * riskMultiplier);
  const calculatedPremium = Math.round((desiredCoverage * annualRate * (durationDays / 365)) + 15);
  const protocolFeeCut = Math.round(calculatedPremium * 0.025); // 2.5% protocol fee (CoverageManager.sol)
  const agentNetEarnings = calculatedPremium - protocolFeeCut;

  return (
    <section className="calculator-section" id="calculator">
      <div className="container">
        <div className="calc-header-block text-center">
          <div className="calc-badge">
            <span className="calc-badge-icon">🧮</span>
            <span>INTERACTIVE PRIMITIVE SIMULATOR</span>
          </div>
          <h2 className="calc-title">
            Test the Protocol Math in Real-Time
          </h2>
          <p className="calc-subtitle">
            See how bonded agent collateral turns into guaranteed full-reserve user protection with zero fractional liabilities.
          </p>
        </div>

        <div className="calc-card glass-panel">
          <div className="calc-grid">
            {/* Input Controls */}
            <div className="calc-controls">
              <h3 className="controls-group-title">Adjust Parameters</h3>

              {/* Slider 1: Agent Collateral */}
              <div className="slider-group">
                <div className="slider-labels">
                  <span className="slider-label">Agent Bonded Collateral:</span>
                  <span className="slider-value">${collateralStaked.toLocaleString()} USDC</span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="100000"
                  step="5000"
                  value={collateralStaked}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setCollateralStaked(val);
                    if (desiredCoverage > val) setDesiredCoverage(val);
                  }}
                  className="calc-range-input"
                />
                <div className="slider-hints">
                  <span>$5,000 (Min)</span>
                  <span>$100,000 (Institutional)</span>
                </div>
              </div>

              {/* Slider 2: User Desired Coverage */}
              <div className="slider-group">
                <div className="slider-labels">
                  <span className="slider-label">User Coverage Protection:</span>
                  <span className="slider-value text-cyan">${desiredCoverage.toLocaleString()} USDC</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max={collateralStaked}
                  step="500"
                  value={desiredCoverage}
                  onChange={(e) => setDesiredCoverage(Number(e.target.value))}
                  className="calc-range-input cyan"
                />
                <div className="slider-hints">
                  <span>$500</span>
                  <span>Max Vault Cap: ${collateralStaked.toLocaleString()}</span>
                </div>
              </div>

              {/* Slider 3: Duration Selection */}
              <div className="slider-group">
                <div className="slider-labels">
                  <span className="slider-label">SLA Protection Duration:</span>
                  <span className="slider-value">{durationDays} Days</span>
                </div>
                <div className="duration-pill-selector">
                  {[7, 14, 30, 60, 90].map((days) => (
                    <button
                      key={days}
                      className={`duration-btn ${durationDays === days ? 'active' : ''}`}
                      onClick={() => setDurationDays(days)}
                    >
                      {days}d
                    </button>
                  ))}
                </div>
              </div>

              {/* Stylus Score Indicator */}
              <div className="calc-stylus-box">
                <div className="stylus-box-left">
                  <span className="stylus-spark">⚡</span>
                  <div>
                    <div className="stylus-box-title">Stylus Risk Engine Score</div>
                    <div className="stylus-box-desc">Deterministic score: 920/1000 (Low Risk Tier)</div>
                  </div>
                </div>
                <span className="stylus-score-badge">920 / 1000</span>
              </div>
            </div>

            {/* Output Display Card */}
            <div className="calc-results glass-panel">
              <div className="results-header">
                <span className="results-tag">GUARANTEED PRIMITIVE OUTPUT</span>
                <span className="results-solvency">100% Full-Reserve</span>
              </div>

              <div className="result-metric-highlight">
                <div className="res-highlight-label">Total Cost to Protect Position</div>
                <div className="res-highlight-num text-gradient">${calculatedPremium} USDC</div>
                <div className="res-highlight-sub">
                  Full SLA coverage for {durationDays} days up to ${desiredCoverage.toLocaleString()} USDC
                </div>
              </div>

              <div className="results-breakdown-list">
                <div className="breakdown-row">
                  <span className="b-label">Max Parametric Payout:</span>
                  <span className="b-val text-cyan font-bold">${desiredCoverage.toLocaleString()} USDC</span>
                </div>

                <div className="breakdown-row">
                  <span className="b-label">Locked Collateral in Vault:</span>
                  <span className="b-val font-mono">${desiredCoverage.toLocaleString()} USDC (1:1 backing)</span>
                </div>

                <div className="breakdown-row">
                  <span className="b-label">Remaining Agent Vault Capacity:</span>
                  <span className="b-val font-mono">${(availableCapacity - desiredCoverage).toLocaleString()} USDC</span>
                </div>

                <div className="breakdown-row">
                  <span className="b-label">Protocol Fee (2.5%):</span>
                  <span className="b-val font-mono">${protocolFeeCut} USDC</span>
                </div>

                <div className="breakdown-row">
                  <span className="b-label">Agent Net Premium Earned:</span>
                  <span className="b-val font-mono text-emerald">${agentNetEarnings} USDC</span>
                </div>
              </div>

              <div className="calc-invariant-proof">
                <span className="proof-check">✓</span>
                <span>
                  <strong>Solvency Invariant:</strong> In the event of a verified breach, ${desiredCoverage.toLocaleString()} USDC is disbursed immediately without human adjusters.
                </span>
              </div>

              <button 
                className="btn-primary-cyan calc-action-btn"
                onClick={() => onSelectCalculatedTerm && onSelectCalculatedTerm(desiredCoverage, calculatedPremium, durationDays)}
              >
                <span>Protect an Agent Position with These Terms →</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
