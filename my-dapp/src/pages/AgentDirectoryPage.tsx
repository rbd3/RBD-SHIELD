import React, { useState, useMemo } from 'react';
import { MOCK_AGENTS } from '../data/mockAgents';
import type { AgentData } from '../data/mockAgents';
import { RegisterAgentModal } from '../components/RegisterAgentModal';
import './AgentDirectoryPage.css';

interface AgentDirectoryPageProps {
  onSelectAgent?: (agent: AgentData) => void;
  onNavigate?: (tab: string) => void;
}

export const AgentDirectoryPage: React.FC<AgentDirectoryPageProps> = ({
  onSelectAgent,
  onNavigate,
}) => {
  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<'All' | 'Low Risk' | 'Moderate' | 'High Risk'>('All');
  const [minCollateral, setMinCollateral] = useState<number>(0);
  const [activeOnly, setActiveOnly] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<'riskDesc' | 'collateralDesc' | 'capacityDesc' | 'uptimeDesc'>('riskDesc');

  // Modals & UI States
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [inspectAgent, setInspectAgent] = useState<AgentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // Copy address helper
  const handleCopy = (address: string, label: string) => {
    navigator.clipboard?.writeText(address);
    setCopiedAddress(`${label}-${address}`);
    setTimeout(() => setCopiedAddress(null), 1800);
  };

  // Simulate loading state for testing UX
  const toggleLoadingSimulation = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  // Filter & Sort Logic
  const filteredAgents = useMemo(() => {
    return MOCK_AGENTS.filter((agent) => {
      // Search query check
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = agent.name.toLowerCase().includes(q);
        const matchesRole = agent.role.toLowerCase().includes(q);
        const matchesDesc = agent.serviceDescription.toLowerCase().includes(q);
        const matchesOperator = agent.operatorAddress?.toLowerCase().includes(q);
        const matchesVault = agent.vaultAddress?.toLowerCase().includes(q);
        if (!matchesName && !matchesRole && !matchesDesc && !matchesOperator && !matchesVault) {
          return false;
        }
      }

      // Tier check
      if (selectedTier !== 'All' && agent.riskTier !== selectedTier) {
        return false;
      }

      // Min Collateral check
      if (agent.collateralUsdc < minCollateral) {
        return false;
      }

      // Active Only check
      if (activeOnly && agent.status !== 'active') {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'riskDesc') return b.riskScore - a.riskScore;
      if (sortBy === 'collateralDesc') return b.collateralUsdc - a.collateralUsdc;
      if (sortBy === 'capacityDesc') return b.availableCapacityUsdc - a.availableCapacityUsdc;
      if (sortBy === 'uptimeDesc') return b.uptimePercent - a.uptimePercent;
      return 0;
    });
  }, [searchQuery, selectedTier, minCollateral, activeOnly, sortBy]);

  // Aggregate stats
  const totalBonded = useMemo(() => {
    return MOCK_AGENTS.reduce((acc, a) => acc + a.collateralUsdc, 0);
  }, []);

  const totalCapacity = useMemo(() => {
    return MOCK_AGENTS.reduce((acc, a) => acc + a.availableCapacityUsdc, 0);
  }, []);

  const avgRiskScore = useMemo(() => {
    const sum = MOCK_AGENTS.reduce((acc, a) => acc + a.riskScore, 0);
    return Math.round(sum / MOCK_AGENTS.length);
  }, []);

  const hasActiveFilters = searchQuery !== '' || selectedTier !== 'All' || minCollateral > 0 || !activeOnly;

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedTier('All');
    setMinCollateral(0);
    setActiveOnly(true);
    setSortBy('riskDesc');
  };

  const handleInspect = (agent: AgentData) => {
    setInspectAgent(agent);
    if (onSelectAgent) {
      onSelectAgent(agent);
    }
  };

  // Helper for radial score SVG
  const renderRadialScore = (score: number) => {
    const radius = 26;
    const circumference = 2 * Math.PI * radius;
    const progress = (score / 1000) * circumference;
    const strokeDashoffset = circumference - progress;

    let color = 'var(--cyan-primary)';
    if (score >= 800) color = 'var(--emerald-safe)';
    else if (score >= 600) color = 'var(--yellow-warn)';
    else color = 'var(--red-risk)';

    return (
      <div className="radial-score-wrap" title={`Stylus Risk Score: ${score}/1000`}>
        <svg className="radial-svg" width="64" height="64" viewBox="0 0 64 64">
          <circle
            className="radial-bg"
            cx="32"
            cy="32"
            r={radius}
            strokeWidth="5"
          />
          <circle
            className="radial-progress"
            cx="32"
            cy="32"
            r={radius}
            strokeWidth="5"
            stroke={color}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 32 32)"
          />
        </svg>
        <div className="radial-text">
          <span className="radial-val" style={{ color }}>{score}</span>
          <span className="radial-max">/1000</span>
        </div>
      </div>
    );
  };

  return (
    <div className="agent-directory-page">
      <div className="container">
        {/* ─── Breadcrumb & Header ────────────────────────────────────────── */}
        <div className="directory-header-row">
          <div className="directory-header-left">
            <div className="directory-badge">
              <span className="badge-pulse"></span>
              <span>ARBITRUM & ROBINHOOD CHAIN AGENT DIRECTORY</span>
            </div>
            <h1 className="directory-title">Autonomous Agent Bond Directory</h1>
            <p className="directory-subtitle">
              Verify cryptographic proofs, Stylus risk ratings, and bonded capital capacity for active autonomous agents.
              Every listed agent backs SLA commitments with locked collateral inside <code>VaultManager</code>.
            </p>
          </div>

          <div className="directory-header-actions">
            <button
              className="btn-register-agent"
              onClick={() => setRegisterModalOpen(true)}
              aria-label="Register Agent and Bond Collateral"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>+ Register Agent & Bond Collateral</span>
            </button>
          </div>
        </div>

        {/* ─── Protocol Aggregate Stats Ribbon ────────────────────────────── */}
        <div className="directory-stats-grid glass-panel">
          <div className="stat-metric">
            <span className="stat-label">Verified Agents</span>
            <div className="stat-val-group">
              <span className="stat-value">{MOCK_AGENTS.length}</span>
              <span className="stat-tag tag-green">100% Bonded</span>
            </div>
            <span className="stat-sub">Across Arbitrum One & Robinhood</span>
          </div>

          <div className="stat-metric">
            <span className="stat-label">Total Collateral Staked</span>
            <div className="stat-val-group">
              <span className="stat-value text-cyan">${(totalBonded / 1000).toFixed(0)}k</span>
              <span className="stat-sub-unit">USDC</span>
            </div>
            <span className="stat-sub">Locked in on-chain vaults</span>
          </div>

          <div className="stat-metric">
            <span className="stat-label">Available Capacity</span>
            <div className="stat-val-group">
              <span className="stat-value text-emerald">${(totalCapacity / 1000).toFixed(0)}k</span>
              <span className="stat-sub-unit">USDC</span>
            </div>
            <span className="stat-sub">{((totalCapacity / totalBonded) * 100).toFixed(0)}% protocol underwriting buffer</span>
          </div>

          <div className="stat-metric">
            <span className="stat-label">Avg Stylus Risk Rating</span>
            <div className="stat-val-group">
              <span className="stat-value">{avgRiskScore}</span>
              <span className="stat-sub-unit">/1000</span>
            </div>
            <span className="stat-sub">Stylus WASM Actuarial Model</span>
          </div>
        </div>

        {/* ─── Filter & Search Bar ────────────────────────────────────────── */}
        <div className="directory-controls glass-panel">
          <div className="controls-primary-row">
            {/* Search Input */}
            <div className="search-input-wrap">
              <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Search by agent name, role, operator address (0x...), or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                aria-label="Search agents"
              />
              {searchQuery && (
                <button
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div className="sort-select-wrap">
              <label htmlFor="sort-select" className="sort-label">Sort By:</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="sort-select"
              >
                <option value="riskDesc">Highest Risk Score</option>
                <option value="collateralDesc">Most Collateral Staked</option>
                <option value="capacityDesc">Highest Available Capacity</option>
                <option value="uptimeDesc">Highest Uptime SLA</option>
              </select>
            </div>
          </div>

          {/* Secondary Controls: Risk Tiers, Collateral Slider, Status */}
          <div className="controls-secondary-row">
            {/* Risk Tier Pills */}
            <div className="tier-pills-group">
              <span className="filter-group-label">Risk Tier:</span>
              {(['All', 'Low Risk', 'Moderate', 'High Risk'] as const).map((tier) => (
                <button
                  key={tier}
                  className={`tier-pill ${selectedTier === tier ? 'active' : ''} ${
                    tier === 'Low Risk' ? 'pill-low' : tier === 'Moderate' ? 'pill-mod' : tier === 'High Risk' ? 'pill-high' : ''
                  }`}
                  onClick={() => setSelectedTier(tier)}
                >
                  {tier}
                  <span className="pill-count">
                    {tier === 'All'
                      ? MOCK_AGENTS.length
                      : MOCK_AGENTS.filter((a) => a.riskTier === tier).length}
                  </span>
                </button>
              ))}
            </div>

            {/* Collateral Slider */}
            <div className="collateral-slider-group">
              <div className="slider-label-row">
                <span className="filter-group-label">Min Collateral:</span>
                <span className="slider-curr-val">
                  {minCollateral === 0 ? 'Any' : `≥ $${(minCollateral / 1000).toFixed(0)}k USDC`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="500000"
                step="25000"
                value={minCollateral}
                onChange={(e) => setMinCollateral(Number(e.target.value))}
                className="collateral-slider"
                aria-label="Minimum Collateral Filter"
              />
            </div>

            {/* Active Toggle & Simulator */}
            <div className="filter-toggles-group">
              <label className="checkbox-toggle">
                <input
                  type="checkbox"
                  checked={activeOnly}
                  onChange={(e) => setActiveOnly(e.target.checked)}
                />
                <span className="toggle-switch"></span>
                <span className="toggle-label">Active Only</span>
              </label>

              <button
                className="btn-ghost-sim"
                onClick={toggleLoadingSimulation}
                title="Simulate Loading Shimmer"
              >
                ↻ Shimmer Test
              </button>

              {hasActiveFilters && (
                <button className="btn-reset-filters" onClick={handleResetFilters}>
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* Active Filter Summary Bar */}
          <div className="filter-status-bar">
            <span className="results-count">
              Showing <strong>{filteredAgents.length}</strong> of {MOCK_AGENTS.length} agents
            </span>

            {hasActiveFilters && (
              <div className="active-filter-chips">
                {searchQuery && (
                  <span className="filter-chip">
                    "{searchQuery}"
                    <button onClick={() => setSearchQuery('')}>✕</button>
                  </span>
                )}
                {selectedTier !== 'All' && (
                  <span className="filter-chip">
                    Tier: {selectedTier}
                    <button onClick={() => setSelectedTier('All')}>✕</button>
                  </span>
                )}
                {minCollateral > 0 && (
                  <span className="filter-chip">
                    Min: ${(minCollateral / 1000).toFixed(0)}k
                    <button onClick={() => setMinCollateral(0)}>✕</button>
                  </span>
                )}
                {!activeOnly && (
                  <span className="filter-chip">
                    Including Paused
                    <button onClick={() => setActiveOnly(true)}>✕</button>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ─── Agent Cards Grid / Shimmer / Empty State ───────────────────── */}
        {isLoading ? (
          /* Shimmer Loading Skeleton */
          <div className="agents-grid">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="agent-card glass-panel skeleton-card">
                <div className="skeleton-header">
                  <div className="skeleton-avatar shimmer"></div>
                  <div className="skeleton-title-group">
                    <div className="skeleton-line shimmer w-60"></div>
                    <div className="skeleton-line shimmer w-40"></div>
                  </div>
                  <div className="skeleton-gauge shimmer"></div>
                </div>
                <div className="skeleton-body">
                  <div className="skeleton-line shimmer w-100"></div>
                  <div className="skeleton-line shimmer w-80"></div>
                </div>
                <div className="skeleton-metrics">
                  <div className="skeleton-metric-box shimmer"></div>
                  <div className="skeleton-metric-box shimmer"></div>
                </div>
                <div className="skeleton-btn shimmer"></div>
              </div>
            ))}
          </div>
        ) : filteredAgents.length === 0 ? (
          /* Empty State */
          <div className="directory-empty-state glass-panel">
            <div className="empty-state-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
            </div>
            <h3 className="empty-state-title">No Autonomous Agents Found</h3>
            <p className="empty-state-desc">
              No agents match your current search and filter combination. Try clearing your search term,
              lowering the minimum collateral requirement, or enabling paused agents.
            </p>
            <button className="btn-primary-cyan" onClick={handleResetFilters}>
              Reset All Filters
            </button>
          </div>
        ) : (
          /* Real Agent Cards Grid */
          <div className="agents-grid">
            {filteredAgents.map((agent) => {
              const capacityPct = Math.round((agent.availableCapacityUsdc / agent.collateralUsdc) * 100);
              const isOperatorCopied = copiedAddress === `op-${agent.operatorAddress}`;
              const isVaultCopied = copiedAddress === `vt-${agent.vaultAddress}`;

              return (
                <div
                  key={agent.id}
                  className={`agent-directory-card glass-panel ${
                    agent.riskTier === 'Low Risk'
                      ? 'border-glow-low'
                      : agent.riskTier === 'Moderate'
                      ? 'border-glow-mod'
                      : 'border-glow-high'
                  }`}
                >
                  {/* Top Card Row: Avatar, Identity, Radial Gauge */}
                  <div className="card-top-row">
                    <div className="card-avatar-wrap">
                      <span className="card-avatar-emoji">{agent.avatar}</span>
                      <span
                        className={`card-status-indicator ${
                          agent.status === 'active' ? 'status-active' : 'status-paused'
                        }`}
                        title={agent.status === 'active' ? 'Active & Underwriting' : 'Underwriting Paused'}
                      />
                    </div>

                    <div className="card-identity">
                      <div className="card-name-row">
                        <h3 className="card-agent-name">{agent.name}</h3>
                      </div>
                      <span className="card-agent-role">{agent.role}</span>
                      <div className="card-badges-row">
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
                        <span className="stylus-verified-pill">Stylus Verified</span>
                      </div>
                    </div>

                    {/* Radial Score Gauge */}
                    <div className="card-gauge-box">
                      {renderRadialScore(agent.riskScore)}
                    </div>
                  </div>

                  {/* Service Description */}
                  <p className="card-service-desc">{agent.serviceDescription}</p>

                  {/* Capacity Bar Visualizer */}
                  <div className="card-capacity-section">
                    <div className="capacity-label-row">
                      <span className="cap-label">Underwriting Capacity</span>
                      <span className="cap-pct text-cyan">{capacityPct}% Available</span>
                    </div>
                    <div className="capacity-bar-track">
                      <div
                        className="capacity-bar-fill"
                        style={{ width: `${capacityPct}%` }}
                      ></div>
                    </div>
                    <div className="capacity-values-row">
                      <span>Available: <strong>${(agent.availableCapacityUsdc).toLocaleString()} USDC</strong></span>
                      <span>Total: ${(agent.collateralUsdc).toLocaleString()} USDC</span>
                    </div>
                  </div>

                  {/* 4-Metric Grid */}
                  <div className="card-metrics-grid">
                    <div className="metric-cell">
                      <span className="m-label">Staked Bond</span>
                      <span className="m-val">${(agent.collateralUsdc / 1000).toFixed(0)}k USDC</span>
                    </div>
                    <div className="metric-cell">
                      <span className="m-label">Uptime SLA</span>
                      <span className="m-val text-emerald">{agent.uptimePercent}%</span>
                    </div>
                    <div className="metric-cell">
                      <span className="m-label">Active Policies</span>
                      <span className="m-val">{agent.activePoliciesCount} Protected</span>
                    </div>
                    <div className="metric-cell">
                      <span className="m-label">Claims Ratio</span>
                      <span className={`m-val ${agent.claimsPaidCount === 0 ? 'text-emerald' : 'text-yellow'}`}>
                        {agent.claimsPaidCount === 0 ? '0 Paid (100% Invariant)' : `${agent.claimsPaidCount} Claims Paid`}
                      </span>
                    </div>
                  </div>

                  {/* Cryptographic Address Row */}
                  <div className="card-addresses-row font-mono">
                    <button
                      className="addr-btn"
                      onClick={() => handleCopy(agent.operatorAddress, 'op')}
                      title="Copy Operator Address"
                    >
                      <span className="addr-tag">Operator:</span>
                      <span className="addr-hash">{agent.operatorAddress.slice(0, 6)}...{agent.operatorAddress.slice(-4)}</span>
                      <span className="copy-icon">{isOperatorCopied ? '✓' : '⧉'}</span>
                    </button>

                    <button
                      className="addr-btn"
                      onClick={() => handleCopy(agent.vaultAddress, 'vt')}
                      title="Copy Vault Address"
                    >
                      <span className="addr-tag">Vault:</span>
                      <span className="addr-hash">{agent.vaultAddress.slice(0, 6)}...{agent.vaultAddress.slice(-4)}</span>
                      <span className="copy-icon">{isVaultCopied ? '✓' : '⧉'}</span>
                    </button>
                  </div>

                  {/* SLA Terms Preview Footer */}
                  <div className="card-sla-preview">
                    <span className="sla-count-tag">
                      {agent.slaTerms.length} SLA Term{agent.slaTerms.length > 1 ? 's' : ''} Available
                    </span>
                    <span className="sla-starting-at">
                      from <strong>{agent.slaTerms[0]?.premiumUsdc} USDC</strong> / {agent.slaTerms[0]?.durationDays}d
                    </span>
                  </div>

                  {/* Action Button */}
                  <button
                    className="btn-inspect-agent"
                    onClick={() => handleInspect(agent)}
                  >
                    <span>Inspect Agent & Terms</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Guided Setup Registration Modal ──────────────────────────────── */}
      <RegisterAgentModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
      />

      {/* ─── Live Inspection & Terms Modal ─────────────────────────────────── */}
      {inspectAgent && (
        <div className="modal-backdrop" onClick={() => setInspectAgent(null)} role="presentation">
          <div
            className="agent-inspect-modal glass-panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="inspect-agent-title"
          >
            <div className="inspect-modal-header">
              <div className="inspect-header-left">
                <div className="inspect-avatar">{inspectAgent.avatar}</div>
                <div>
                  <div className="inspect-tag-row">
                    <span className="stylus-pill">STYLUS VERIFIED</span>
                    <span className={`tier-badge ${
                      inspectAgent.riskTier === 'Low Risk' ? 'tier-low' : inspectAgent.riskTier === 'Moderate' ? 'tier-mod' : 'tier-high'
                    }`}>
                      {inspectAgent.riskTier}
                    </span>
                  </div>
                  <h2 className="inspect-modal-title" id="inspect-agent-title">{inspectAgent.name}</h2>
                  <span className="inspect-modal-role">{inspectAgent.role}</span>
                </div>
              </div>
              <button
                className="btn-close"
                onClick={() => setInspectAgent(null)}
                aria-label="Close Inspection Modal"
              >
                ✕
              </button>
            </div>

            <div className="inspect-modal-body">
              {/* Agent Overview Grid */}
              <div className="inspect-overview-grid">
                <div className="inspect-metric-card">
                  <span className="im-label">Stylus Actuarial Score</span>
                  <span className="im-val text-cyan">{inspectAgent.riskScore} / 1000</span>
                  <span className="im-sub">WASM multi-factor model</span>
                </div>
                <div className="inspect-metric-card">
                  <span className="im-label">Total Staked Collateral</span>
                  <span className="im-val">${inspectAgent.collateralUsdc.toLocaleString()} USDC</span>
                  <span className="im-sub">Locked in VaultManager</span>
                </div>
                <div className="inspect-metric-card">
                  <span className="im-label">Available Capacity</span>
                  <span className="im-val text-emerald">${inspectAgent.availableCapacityUsdc.toLocaleString()} USDC</span>
                  <span className="im-sub">Immediate coverage liquidity</span>
                </div>
                <div className="inspect-metric-card">
                  <span className="im-label">Uptime Reliability</span>
                  <span className="im-val">{inspectAgent.uptimePercent}%</span>
                  <span className="im-sub">{inspectAgent.claimsPaidCount} claims executed</span>
                </div>
              </div>

              {/* Service Description */}
              <div className="inspect-desc-box">
                <h4 className="box-title">Underwritten Service Scope</h4>
                <p>{inspectAgent.serviceDescription}</p>
                <div className="inspect-hashes font-mono">
                  <div>
                    <span>Operator: </span>
                    <code>{inspectAgent.operatorAddress}</code>
                  </div>
                  <div>
                    <span>Vault: </span>
                    <code>{inspectAgent.vaultAddress}</code>
                  </div>
                </div>
              </div>

              {/* Available SLA Protection Terms */}
              <div className="inspect-terms-section">
                <h4 className="box-title">Available Parametric SLA Terms</h4>
                <div className="sla-terms-list">
                  {inspectAgent.slaTerms.map((term, index) => (
                    <div key={index} className="sla-term-card">
                      <div className="sla-term-top">
                        <div>
                          <h5 className="sla-term-name">{term.termName}</h5>
                          <span className="sla-term-trigger">Trigger: {term.failureTrigger}</span>
                        </div>
                        <div className="sla-pricing-box">
                          <span className="sla-premium-tag">{term.premiumUsdc} USDC</span>
                          <span className="sla-term-duration">{term.durationDays} Days</span>
                        </div>
                      </div>

                      <div className="sla-term-bottom">
                        <div className="sla-payout-info">
                          <span className="label">Guaranteed Payout:</span>
                          <strong className="text-cyan">${term.maxPayoutUsdc.toLocaleString()} USDC</strong>
                        </div>

                        <button
                          className="btn-protect-now"
                          onClick={() => {
                            setInspectAgent(null);
                            if (onNavigate) onNavigate('coverage');
                          }}
                        >
                          Protect Position →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="inspect-modal-footer">
              <span className="font-mono text-dim">Settled on Arbitrum One • Multi-factor Stylus WASM Engine</span>
              <button className="btn-secondary" onClick={() => setInspectAgent(null)}>
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
