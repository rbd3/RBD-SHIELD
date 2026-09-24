import React, { useState } from 'react';
import { MOCK_AGENTS } from '../data/mockAgents';
import type { AgentData } from '../data/mockAgents';
import './AgentDetailPage.css';

interface AgentDetailPageProps {
  agent?: AgentData | null;
  onBackToDirectory: () => void;
  onSelectAgent?: (agent: AgentData) => void;
  onNavigate?: (tab: string) => void;
}

export const AgentDetailPage: React.FC<AgentDetailPageProps> = ({
  agent: initialAgent,
  onBackToDirectory,
  onSelectAgent,
  onNavigate,
}) => {
  // Use passed agent or default to first agent
  const [selectedAgentId, setSelectedAgentId] = useState<string>(
    initialAgent?.id || MOCK_AGENTS[0].id
  );

  const agent = MOCK_AGENTS.find((a) => a.id === selectedAgentId) || MOCK_AGENTS[0];

  const [activeTab, setActiveTab] = useState<'terms' | 'performance' | 'vault'>('terms');
  const [selectedTermForPurchase, setSelectedTermForPurchase] = useState<typeof agent.slaTerms[0] | null>(null);
  const [purchaseStep, setPurchaseStep] = useState<'review' | 'approving' | 'approved' | 'minting' | 'success'>('review');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleAgentChange = (id: string) => {
    setSelectedAgentId(id);
    const newAgent = MOCK_AGENTS.find((a) => a.id === id);
    if (newAgent && onSelectAgent) {
      onSelectAgent(newAgent);
    }
  };

  const handleStartPurchase = (term: typeof agent.slaTerms[0]) => {
    setSelectedTermForPurchase(term);
    setPurchaseStep('review');
  };

  const handleExecutePurchase = () => {
    setPurchaseStep('approving');
    setTimeout(() => {
      setPurchaseStep('minting');
      setTimeout(() => {
        setPurchaseStep('success');
      }, 1200);
    }, 1000);
  };

  const capacityPct = Math.round((agent.availableCapacityUsdc / agent.collateralUsdc) * 100);

  // Uptime score contribution calculation (weights: 30%, 25%, 25%, 20%)
  const uptimePts = ((agent.riskBreakdown.uptimeScore * 300) / 1000).toFixed(1);
  const volPts = ((agent.riskBreakdown.volatilityScore * 250) / 1000).toFixed(1);
  const utilPts = ((agent.riskBreakdown.utilizationScore * 250) / 1000).toFixed(1);
  const claimsPts = ((agent.riskBreakdown.claimsScore * 200) / 1000).toFixed(1);

  return (
    <div className="agent-detail-page">
      <div className="container">
        {/* ─── Breadcrumb & Switcher Bar ──────────────────────────────────── */}
        <div className="detail-top-nav">
          <button className="btn-back-crumb" onClick={onBackToDirectory}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Back to Agent Directory</span>
          </button>

          <div className="agent-quick-switcher">
            <span className="switcher-label">Switch Agent:</span>
            <select
              value={agent.id}
              onChange={(e) => handleAgentChange(e.target.value)}
              className="agent-switcher-select font-mono"
            >
              {MOCK_AGENTS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.avatar} {a.name} ({a.riskScore}/1000)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ─── Agent Profile Hero ─────────────────────────────────────────── */}
        <div className="agent-hero-card glass-panel">
          <div className="hero-main-row">
            {/* Avatar & Identity */}
            <div className="hero-identity-group">
              <div className="hero-avatar-box">
                <span className="hero-avatar-emoji">{agent.avatar}</span>
                <span
                  className={`hero-status-dot ${agent.status === 'active' ? 'status-active' : 'status-paused'}`}
                  title={agent.status === 'active' ? 'Active Underwriting' : 'Underwriting Paused'}
                />
              </div>

              <div className="hero-text-block">
                <div className="hero-badges-row">
                  <span className="chain-badge font-mono">{agent.chain}</span>
                  <span
                    className={`tier-badge ${
                      agent.riskTier === 'Low Risk'
                        ? 'tier-low'
                        : agent.riskTier === 'Moderate'
                        ? 'tier-mod'
                        : 'tier-high'
                    }`}
                  >
                    {agent.riskTier}
                  </span>
                  <span className="stylus-pill font-mono">Arbitrum Stylus Verified</span>
                </div>

                <h1 className="hero-agent-title">{agent.name}</h1>
                <p className="hero-agent-role">{agent.role}</p>

                <p className="hero-agent-desc">{agent.serviceDescription}</p>

                {/* Cryptographic Contract Links */}
                <div className="hero-contracts-row font-mono">
                  <button
                    className="contract-pill-btn"
                    onClick={() => handleCopy(agent.operatorAddress, 'op')}
                    title="Click to copy Operator Address"
                  >
                    <span className="c-tag">Operator:</span>
                    <span className="c-addr">{agent.operatorAddress.slice(0, 8)}...{agent.operatorAddress.slice(-6)}</span>
                    <span className="c-copy">{copiedKey === 'op' ? '✓ Copied' : '⧉'}</span>
                  </button>

                  <button
                    className="contract-pill-btn"
                    onClick={() => handleCopy(agent.vaultAddress, 'vault')}
                    title="Click to copy Vault Address"
                  >
                    <span className="c-tag">VaultManager:</span>
                    <span className="c-addr">{agent.vaultAddress.slice(0, 8)}...{agent.vaultAddress.slice(-6)}</span>
                    <span className="c-copy">{copiedKey === 'vault' ? '✓ Copied' : '⧉'}</span>
                  </button>

                  <span className="registration-tag">
                    Registered {agent.registeredDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Overall Score Meter Callout */}
            <div className="hero-score-box glass-panel">
              <span className="score-box-label">STYLUS RISK RATING</span>
              <div className="score-number-row">
                <span className={`hero-score-num ${agent.riskScore >= 800 ? 'text-emerald' : agent.riskScore >= 600 ? 'text-yellow' : 'text-red'}`}>
                  {agent.riskScore}
                </span>
                <span className="hero-score-denom">/1000</span>
              </div>
              <span className="score-box-tier">{agent.riskTier} Profile</span>
              <div className="score-box-footer">
                <span className="dot-green"></span>
                <span>WASM Actuarial Engine</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics KPI Bar */}
          <div className="hero-kpi-bar">
            <div className="kpi-item">
              <span className="kpi-label">Bonded Collateral</span>
              <span className="kpi-val text-cyan">${(agent.collateralUsdc).toLocaleString()} USDC</span>
              <span className="kpi-sub">Locked in on-chain vault</span>
            </div>

            <div className="kpi-item">
              <span className="kpi-label">Underwriting Capacity</span>
              <div className="kpi-val-group">
                <span className="kpi-val text-emerald">${(agent.availableCapacityUsdc).toLocaleString()} USDC</span>
                <span className="kpi-badge">{capacityPct}% Free</span>
              </div>
              <span className="kpi-sub">Available for new policies</span>
            </div>

            <div className="kpi-item">
              <span className="kpi-label">Verified Uptime</span>
              <span className="kpi-val">{agent.uptimePercent}%</span>
              <span className="kpi-sub">30-day continuous heartbeat</span>
            </div>

            <div className="kpi-item">
              <span className="kpi-label">Active Policies</span>
              <span className="kpi-val">{agent.activePoliciesCount} Protected</span>
              <span className="kpi-sub">{agent.claimsPaidCount} claims settled historically</span>
            </div>
          </div>
        </div>

        {/* ─── Stylus Multi-Factor Actuarial Breakdown Widget ─────────────── */}
        <div className="stylus-breakdown-card glass-panel">
          <div className="breakdown-header">
            <div className="bh-left">
              <div className="stylus-chip">
                <span className="chip-glow"></span>
                <span>ARBITRUM STYLUS RUST RISK ENGINE</span>
              </div>
              <h2 className="breakdown-title">Multi-Factor On-Chain Actuarial Scoring</h2>
              <p className="breakdown-subtitle">
                Unlike off-chain credit scores, this rating is calculated deterministically on-chain inside the Rust WASM
                <code>RiskEngine</code> smart contract. The score determines the maximum coverage capacity and required reserve ratio.
              </p>
            </div>

            <div className="breakdown-formula-box font-mono">
              <span className="formula-label">Stylus Fixed-Point Weighted Formula:</span>
              <code className="formula-code">
                Score = (Uptime × 30%) + (Volatility × 25%) + (Utilization × 25%) + (Claims × 20%)
              </code>
            </div>
          </div>

          {/* 4 Factor Visual Breakdown Grid */}
          <div className="factors-grid">
            {/* Factor 1: Uptime */}
            <div className="factor-card">
              <div className="factor-top">
                <div>
                  <span className="factor-weight">30% Weight</span>
                  <h4 className="factor-name">Uptime SLA Reliability</h4>
                </div>
                <div className="factor-score-wrap">
                  <span className="factor-score text-emerald">{agent.riskBreakdown.uptimeScore}</span>
                  <span className="factor-contrib">+{uptimePts} pts</span>
                </div>
              </div>
              <div className="factor-track">
                <div
                  className="factor-fill bg-emerald"
                  style={{ width: `${(agent.riskBreakdown.uptimeScore / 1000) * 100}%` }}
                ></div>
              </div>
              <p className="factor-desc">
                Continuous keeper heartbeats every 60 seconds on Arbitrum. Current uptime: <strong>{agent.uptimePercent}%</strong>.
              </p>
            </div>

            {/* Factor 2: Volatility */}
            <div className="factor-card">
              <div className="factor-top">
                <div>
                  <span className="factor-weight">25% Weight</span>
                  <h4 className="factor-name">Execution Volatility</h4>
                </div>
                <div className="factor-score-wrap">
                  <span className="factor-score text-cyan">{agent.riskBreakdown.volatilityScore}</span>
                  <span className="factor-contrib">+{volPts} pts</span>
                </div>
              </div>
              <div className="factor-track">
                <div
                  className="factor-fill bg-cyan"
                  style={{ width: `${(agent.riskBreakdown.volatilityScore / 1000) * 100}%` }}
                ></div>
              </div>
              <p className="factor-desc">
                Measures maximum drawdown against volatility boundaries. Max recorded drawdown: <strong>{agent.performanceMetrics.maxDrawdownPct}%</strong>.
              </p>
            </div>

            {/* Factor 3: Capital Utilization */}
            <div className="factor-card">
              <div className="factor-top">
                <div>
                  <span className="factor-weight">25% Weight</span>
                  <h4 className="factor-name">Capital Solvency Ratio</h4>
                </div>
                <div className="factor-score-wrap">
                  <span className="factor-score text-cyan">{agent.riskBreakdown.utilizationScore}</span>
                  <span className="factor-contrib">+{utilPts} pts</span>
                </div>
              </div>
              <div className="factor-track">
                <div
                  className="factor-fill bg-cyan"
                  style={{ width: `${(agent.riskBreakdown.utilizationScore / 1000) * 100}%` }}
                ></div>
              </div>
              <p className="factor-desc">
                Ratio of locked liabilities to total staked collateral in <code>VaultManager</code>. Current buffer: <strong>{capacityPct}% Available</strong>.
              </p>
            </div>

            {/* Factor 4: Claim History */}
            <div className="factor-card">
              <div className="factor-top">
                <div>
                  <span className="factor-weight">20% Weight</span>
                  <h4 className="factor-name">Claim Invariant Record</h4>
                </div>
                <div className="factor-score-wrap">
                  <span className={`factor-score ${agent.riskBreakdown.claimsScore >= 900 ? 'text-emerald' : 'text-yellow'}`}>
                    {agent.riskBreakdown.claimsScore}
                  </span>
                  <span className="factor-contrib">+{claimsPts} pts</span>
                </div>
              </div>
              <div className="factor-track">
                <div
                  className="factor-fill bg-emerald"
                  style={{ width: `${(agent.riskBreakdown.claimsScore / 1000) * 100}%` }}
                ></div>
              </div>
              <p className="factor-desc">
                Slashing resistance and automated parametric settlement history. <strong>{agent.claimsPaidCount} settled claim{agent.claimsPaidCount === 1 ? '' : 's'}</strong> on record.
              </p>
            </div>
          </div>
        </div>

        {/* ─── Interactive Tabs (Terms / Performance / Vault) ─────────────── */}
        <div className="detail-tabs-section">
          <div className="tabs-nav-bar">
            <button
              className={`detail-tab-btn ${activeTab === 'terms' ? 'active' : ''}`}
              onClick={() => setActiveTab('terms')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              <span>1. Available SLA Coverage Terms ({agent.slaTerms.length})</span>
            </button>

            <button
              className={`detail-tab-btn ${activeTab === 'performance' ? 'active' : ''}`}
              onClick={() => setActiveTab('performance')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
              <span>2. Performance & Heartbeats</span>
            </button>

            <button
              className={`detail-tab-btn ${activeTab === 'vault' ? 'active' : ''}`}
              onClick={() => setActiveTab('vault')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
              <span>3. Vault Reserves & Claims Activity ({agent.historicalClaims.length})</span>
            </button>
          </div>

          {/* TAB 1: Coverage Terms */}
          {activeTab === 'terms' && (
            <div className="tab-pane terms-pane">
              <div className="pane-header-intro">
                <h3 className="pane-title">Select an Underwritten SLA Protection Policy</h3>
                <p className="pane-subtitle">
                  Parametric coverage policies are minted as smart contract agreements via <code>CoverageManager</code>.
                  If the verifiable failure condition is triggered on-chain, guaranteed USDC is instantly disbursed from the agent's vault without claims adjuster delays.
                </p>
              </div>

              <div className="terms-cards-grid">
                {agent.slaTerms.map((term, index) => (
                  <div key={index} className="sla-term-detail-card glass-panel">
                    <div className="term-card-badge-row">
                      <span className="term-tier-chip font-mono">Tier {index + 1} Protection</span>
                      <span className="term-duration-chip font-mono">{term.durationDays} Days Duration</span>
                    </div>

                    <h4 className="term-title">{term.termName}</h4>

                    {/* Trigger Condition Callout */}
                    <div className="term-trigger-callout">
                      <div className="trigger-icon">⚠️</div>
                      <div className="trigger-text">
                        <span className="trigger-label">VERIFIABLE PARAMETRIC TRIGGER</span>
                        <p className="trigger-condition">{term.failureTrigger}</p>
                      </div>
                    </div>

                    {/* Financial Specs */}
                    <div className="term-financials-grid">
                      <div className="fin-box">
                        <span className="fin-label">Max Guaranteed Payout</span>
                        <strong className="fin-val text-cyan">${term.maxPayoutUsdc.toLocaleString()} USDC</strong>
                        <span className="fin-sub">Liquidated from vault</span>
                      </div>

                      <div className="fin-box">
                        <span className="fin-label">Policy Premium Cost</span>
                        <strong className="fin-val text-emerald">${term.premiumUsdc.toLocaleString()} USDC</strong>
                        <span className="fin-sub">{term.durationDays} days fixed</span>
                      </div>

                      <div className="fin-box">
                        <span className="fin-label">Payout Settlement</span>
                        <strong className="fin-val">Instant</strong>
                        <span className="fin-sub">Smart Contract Settlement</span>
                      </div>

                      <div className="fin-box">
                        <span className="fin-label">Deductible</span>
                        <strong className="fin-val text-emerald">0%</strong>
                        <span className="fin-sub">No user deductible</span>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <button
                      className="btn-select-sla"
                      onClick={() => handleStartPurchase(term)}
                    >
                      <span>Protect Position with this SLA →</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Performance History & Heartbeats */}
          {activeTab === 'performance' && (
            <div className="tab-pane performance-pane">
              <div className="pane-header-intro">
                <h3 className="pane-title">Verifiable On-Chain Execution History</h3>
                <p className="pane-subtitle">
                  Historical telemetry streamed from Arbitrum keeper networks and cross-chain oracles.
                </p>
              </div>

              {/* Performance Stats Cards */}
              <div className="perf-stats-row">
                <div className="perf-metric-card glass-panel">
                  <span className="pm-label">Total Execution Volume</span>
                  <span className="pm-val">${(agent.performanceMetrics.totalVolumeUsdc / 1000000).toFixed(1)}M USDC</span>
                  <span className="pm-sub">Processed through DEX routing</span>
                </div>

                <div className="perf-metric-card glass-panel">
                  <span className="pm-label">Average Execution Speed</span>
                  <span className="pm-val text-cyan">{agent.performanceMetrics.avgExecutionLatencyMs}ms</span>
                  <span className="pm-sub">Sub-block execution benchmark</span>
                </div>

                <div className="perf-metric-card glass-panel">
                  <span className="pm-label">Max Historical Drawdown</span>
                  <span className="pm-val text-emerald">{agent.performanceMetrics.maxDrawdownPct}%</span>
                  <span className="pm-sub">Strictly within SLA parameter</span>
                </div>

                <div className="perf-metric-card glass-panel">
                  <span className="pm-label">Verified Heartbeats</span>
                  <span className="pm-val">{agent.performanceMetrics.heartbeatsVerified.toLocaleString()}</span>
                  <span className="pm-sub">Consecutive oracle pings</span>
                </div>
              </div>

              {/* 30-Day Uptime Calendar Heatmap */}
              <div className="uptime-heatmap-card glass-panel">
                <div className="heatmap-header">
                  <div>
                    <h4 className="box-title">30-Day SLA Uptime Invariant Matrix</h4>
                    <span className="heatmap-sub">Every block represents 24 hours of verified continuous execution</span>
                  </div>
                  <div className="heatmap-legend font-mono">
                    <span className="legend-item"><span className="legend-dot green"></span> 99.9%+ Uptime</span>
                    <span className="legend-item"><span className="legend-dot yellow"></span> Degradation</span>
                  </div>
                </div>

                <div className="heatmap-blocks-row">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div
                      key={i}
                      className={`uptime-block ${i === 18 && agent.riskTier === 'High Risk' ? 'block-warn' : 'block-perfect'}`}
                      title={`Day ${30 - i}: 99.98% Uptime SLA verified`}
                    >
                      <span className="block-day">{30 - i}d</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Heartbeat Ledger Table */}
              <div className="ledger-card glass-panel">
                <h4 className="box-title">Recent Heartbeat Oracle Verification Log</h4>
                <div className="table-responsive">
                  <table className="ledger-table font-mono">
                    <thead>
                      <tr>
                        <th>Block Number</th>
                        <th>Timestamp</th>
                        <th>SLA Health Status</th>
                        <th>Execution Latency</th>
                        <th>Cryptographic Proof</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { block: '#21,490,140', time: '1 min ago', status: 'Optimal', latency: '340ms', hash: '0x8f21...912a' },
                        { block: '#21,489,980', time: '3 mins ago', status: 'Optimal', latency: '360ms', hash: '0x4e12...b991' },
                        { block: '#21,489,820', time: '5 mins ago', status: 'Optimal', latency: '380ms', hash: '0x1a74...32c0' },
                        { block: '#21,489,660', time: '8 mins ago', status: 'Optimal', latency: '320ms', hash: '0x99e8...714d' },
                        { block: '#21,489,500', time: '10 mins ago', status: 'Optimal', latency: '390ms', hash: '0x3c21...881f' },
                      ].map((log, idx) => (
                        <tr key={idx}>
                          <td>{log.block}</td>
                          <td>{log.time}</td>
                          <td><span className="status-pill-green">● {log.status}</span></td>
                          <td>{log.latency}</td>
                          <td><code className="text-cyan">{log.hash}</code></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Vault Reserves & Claims */}
          {activeTab === 'vault' && (
            <div className="tab-pane vault-pane">
              <div className="pane-header-intro">
                <h3 className="pane-title">Solvency & Parametric Slashing Ledger</h3>
                <p className="pane-subtitle">
                  All collateral is locked in <code>VaultManager</code> on Arbitrum One. Slashing occurs automatically upon cryptographic proof submission.
                </p>
              </div>

              {/* Vault Reserves Breakdown */}
              <div className="vault-reserves-grid">
                <div className="vr-card glass-panel">
                  <span className="vr-label">Total Vault Collateral</span>
                  <span className="vr-value text-cyan">${agent.collateralUsdc.toLocaleString()} USDC</span>
                  <span className="vr-sub">Locked in smart contract custody</span>
                </div>

                <div className="vr-card glass-panel">
                  <span className="vr-label">Free Liquidity Buffer</span>
                  <span className="vr-value text-emerald">${agent.availableCapacityUsdc.toLocaleString()} USDC</span>
                  <span className="vr-sub">{capacityPct}% unencumbered capacity</span>
                </div>

                <div className="vr-card glass-panel">
                  <span className="vr-label">Locked for Active SLAs</span>
                  <span className="vr-value">${(agent.collateralUsdc - agent.availableCapacityUsdc).toLocaleString()} USDC</span>
                  <span className="vr-sub">{agent.activePoliciesCount} policy commitments</span>
                </div>

                <div className="vr-card glass-panel">
                  <span className="vr-label">Historical Claims Paid</span>
                  <span className={`vr-value ${agent.claimsPaidCount === 0 ? 'text-emerald' : 'text-yellow'}`}>
                    {agent.claimsPaidCount === 0 ? '0 Claims' : `${agent.claimsPaidCount} Claims`}
                  </span>
                  <span className="vr-sub">{agent.claimsPaidCount === 0 ? '100% Invariant Preserved' : 'Paid out automatically'}</span>
                </div>
              </div>

              {/* Claims History Table */}
              <div className="claims-history-box glass-panel">
                <h4 className="box-title">Parametric Claims Log</h4>
                {agent.historicalClaims.length === 0 ? (
                  <div className="no-claims-view">
                    <div className="nc-icon">🛡️</div>
                    <h5 className="nc-title">100% Solvency Invariant Maintained</h5>
                    <p className="nc-desc">
                      Zero slashing events or SLA failure claims have ever been executed against this agent's vault.
                      All performance commitments have settled without default.
                    </p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="ledger-table font-mono">
                      <thead>
                        <tr>
                          <th>Claim ID</th>
                          <th>Date</th>
                          <th>Disbursed Amount</th>
                          <th>Parametric Trigger Condition</th>
                          <th>Status</th>
                          <th>Settlement Tx</th>
                        </tr>
                      </thead>
                      <tbody>
                        {agent.historicalClaims.map((claim) => (
                          <tr key={claim.id}>
                            <td>{claim.id}</td>
                            <td>{claim.timestamp}</td>
                            <td className="text-yellow">${claim.amountUsdc.toLocaleString()} USDC</td>
                            <td className="font-sans">{claim.triggerReason}</td>
                            <td><span className="status-pill-green">✓ {claim.status}</span></td>
                            <td><code className="text-cyan">{claim.txHash}</code></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Two-Step SLA Purchase Modal ───────────────────────────────────── */}
      {selectedTermForPurchase && (
        <div className="modal-backdrop" onClick={() => setSelectedTermForPurchase(null)} role="presentation">
          <div
            className="purchase-modal-card glass-panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="purchase-policy-title"
          >
            <div className="purchase-modal-header">
              <div>
                <span className="p-tag font-mono">COVERAGE PURCHASE STEPPER</span>
                <h3 className="p-title" id="purchase-policy-title">Acquire SLA Protection Policy</h3>
                <span className="p-agent-name">{agent.name} • {selectedTermForPurchase.termName}</span>
              </div>
              <button
                className="btn-close"
                onClick={() => setSelectedTermForPurchase(null)}
                aria-label="Close purchase modal"
              >
                ✕
              </button>
            </div>

            <div className="purchase-modal-body">
              {purchaseStep === 'review' && (
                <div className="purchase-review-flow">
                  {/* Summary Comparison */}
                  <div className="purchase-summary-cards">
                    <div className="psc-card psc-coverage">
                      <span className="psc-label">GUARANTEED PAYOUT</span>
                      <strong className="psc-val text-cyan">${selectedTermForPurchase.maxPayoutUsdc.toLocaleString()} USDC</strong>
                      <span className="psc-sub">Disbursed immediately if SLA breached</span>
                    </div>

                    <div className="psc-card psc-premium">
                      <span className="psc-label">POLICY PREMIUM COST</span>
                      <strong className="psc-val text-emerald">${selectedTermForPurchase.premiumUsdc.toLocaleString()} USDC</strong>
                      <span className="psc-sub">One-time payment for {selectedTermForPurchase.durationDays} days</span>
                    </div>
                  </div>

                  {/* Trigger Condition Confirmation */}
                  <div className="purchase-trigger-box">
                    <span className="ptb-label font-mono">Smart Contract Trigger Condition:</span>
                    <p className="ptb-cond">{selectedTermForPurchase.failureTrigger}</p>
                  </div>

                  {/* Stepper Breakdown */}
                  <div className="purchase-stepper-preview">
                    <div className="step-row">
                      <span className="step-num">1</span>
                      <div className="step-info">
                        <strong>Approve USDC Allowance</strong>
                        <span>Permits <code>CoverageManager</code> to transfer {selectedTermForPurchase.premiumUsdc} USDC premium</span>
                      </div>
                    </div>
                    <div className="step-row">
                      <span className="step-num">2</span>
                      <div className="step-info">
                        <strong>Mint Parametric Policy</strong>
                        <span>Executes <code>purchasePolicy()</code> and issues active bond coverage ID</span>
                      </div>
                    </div>
                  </div>

                  <button className="btn-confirm-purchase" onClick={handleExecutePurchase}>
                    Approve USDC & Confirm Purchase (${selectedTermForPurchase.premiumUsdc} USDC)
                  </button>
                </div>
              )}

              {(purchaseStep === 'approving' || purchaseStep === 'minting') && (
                <div className="purchase-loading-flow">
                  <div className="spinner-glow"></div>
                  <h4 className="loading-title">
                    {purchaseStep === 'approving' ? 'Step 1/2: Approving USDC Allowance...' : 'Step 2/2: Minting Coverage Policy on Arbitrum...'}
                  </h4>
                  <p className="loading-desc">
                    Interacting with <code>CoverageManager</code> smart contract. Please confirm the transaction in your connected wallet.
                  </p>
                </div>
              )}

              {purchaseStep === 'success' && (
                <div className="purchase-success-flow">
                  <div className="success-icon-badge">✓</div>
                  <h4 className="success-title">SLA Protection Policy Active!</h4>
                  <p className="success-desc">
                    Your position is now cryptographically insured for up to <strong>${selectedTermForPurchase.maxPayoutUsdc.toLocaleString()} USDC</strong> over the next <strong>{selectedTermForPurchase.durationDays} days</strong>.
                  </p>

                  <div className="policy-receipt-box font-mono">
                    <div className="pr-row">
                      <span>Policy Token ID:</span>
                      <strong className="text-cyan">#POL-84920</strong>
                    </div>
                    <div className="pr-row">
                      <span>Underwriting Agent:</span>
                      <span>{agent.name}</span>
                    </div>
                    <div className="pr-row">
                      <span>Coverage Guarantee:</span>
                      <span className="text-cyan">${selectedTermForPurchase.maxPayoutUsdc.toLocaleString()} USDC</span>
                    </div>
                    <div className="pr-row">
                      <span>Settlement Transaction:</span>
                      <code className="text-emerald">0x4a92...e814</code>
                    </div>
                  </div>

                  <div className="success-actions-row">
                    <button
                      className="btn-primary-cyan"
                      onClick={() => {
                        setSelectedTermForPurchase(null);
                        if (onNavigate) onNavigate('coverage');
                      }}
                    >
                      View in My Coverage Hub →
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => setSelectedTermForPurchase(null)}
                    >
                      Close Receipt
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
