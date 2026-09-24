import { useMemo, useState } from 'react';
import { MOCK_AGENTS } from '../data/mockAgents';
import './AnalyticsPage.css';

const tvlSeries = [420, 455, 472, 510, 548, 585, 604, 632, 675, 702, 748, 781];
const coverageSeries = [155, 170, 184, 202, 224, 242, 265, 289, 310, 335, 361, 388];
const labels = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];

export const AnalyticsPage = ({ onNavigate }: { onNavigate: (tab: string) => void }) => {
  const [range, setRange] = useState<'6M' | '12M'>('12M');
  const totalCollateral = useMemo(() => MOCK_AGENTS.reduce((sum, agent) => sum + agent.collateralUsdc, 0), []);
  const availableCapacity = useMemo(() => MOCK_AGENTS.reduce((sum, agent) => sum + agent.availableCapacityUsdc, 0), []);
  const totalClaims = useMemo(() => MOCK_AGENTS.flatMap((agent) => agent.historicalClaims).reduce((sum, claim) => sum + claim.amountUsdc, 0), []);
  const activeCoverage = totalCollateral - availableCapacity;
  const data = range === '6M' ? tvlSeries.slice(-6) : tvlSeries;
  const coverage = range === '6M' ? coverageSeries.slice(-6) : coverageSeries;
  const monthLabels = range === '6M' ? labels.slice(-6) : labels;
  const chartPoints = (series: number[]) => series.map((value, index) => `${(index / (series.length - 1)) * 100},${100 - ((value - 100) / 720) * 92}`).join(' ');

  return <main className="analytics-page"><div className="container">
    <section className="analytics-hero"><div className="analytics-hero-copy"><div className="analytics-eyebrow"><span /> PROTOCOL OBSERVABILITY</div><h1>Analytics</h1><p>Live economic invariants, collateral capacity, and Stylus risk-compute benchmarks across the RBD Shield network.</p><div className="invariant-chip"><span>✓</span><div><strong>100% Full-Reserve Backed</strong><small>Total locked liabilities remain within deposited collateral.</small></div></div></div><div className="analytics-brand-art"><img src="/rbdshieldLogo3.jpeg" alt="RBD Shield protocol artwork" /><div className="art-label"><span>RBD SHIELD</span><strong>Bonded intelligence</strong></div></div></section>

    <section className="analytics-metrics" aria-label="Protocol health metrics"><div className="metric-card glass-panel"><span>Protocol TVL</span><strong className="text-cyan">${(totalCollateral / 1_000_000).toFixed(2)}M</strong><small>USDC locked across bonded vaults</small></div><div className="metric-card glass-panel"><span>Active coverage capacity</span><strong>${(activeCoverage / 1000).toFixed(0)}k</strong><small>{((activeCoverage / totalCollateral) * 100).toFixed(1)}% of collateral currently committed</small></div><div className="metric-card glass-panel"><span>Cumulative premiums</span><strong className="text-emerald">$14.8k</strong><small>Protocol revenue: $370 at 2.5%</small></div><div className="metric-card glass-panel"><span>Settled payouts</span><strong>${totalClaims.toLocaleString()}</strong><small>All sourced from bonded agent vaults</small></div></section>

    <section className="analytics-grid"><div className="growth-panel glass-panel"><div className="panel-title-row"><div><span className="panel-kicker">COLLATERAL VELOCITY</span><h2>TVL and coverage growth</h2><p>Protocol capital and active coverage over time, in thousands of USDC.</p></div><div className="range-controls" aria-label="Chart date range"><button className={range === '6M' ? 'active' : ''} onClick={() => setRange('6M')}>6M</button><button className={range === '12M' ? 'active' : ''} onClick={() => setRange('12M')}>12M</button></div></div><div className="chart-legend"><span><i className="tvl" /> Bonded TVL</span><span><i className="coverage" /> Active coverage</span></div><div className="line-chart" aria-label="TVL and active coverage line chart"><div className="chart-grid-lines" /> <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img"><polyline points={chartPoints(data)} className="line-tvl" /><polyline points={chartPoints(coverage)} className="line-coverage" /></svg></div><div className="chart-labels">{monthLabels.map((label) => <span key={label}>{label}</span>)}</div></div>
    <div className="loss-panel glass-panel"><span className="panel-kicker">LOSS RATIO</span><h2>Claims vs premiums</h2><div className="loss-gauge"><div className="loss-gauge-inner"><strong>18.4%</strong><span>loss ratio</span></div></div><div className="loss-rows"><div><span>Premiums earned</span><strong className="text-emerald">$14,800</strong></div><div><span>Eligible claims paid</span><strong>$2,730</strong></div><div><span>Reserve buffer</span><strong className="text-cyan">$1.38M</strong></div></div></div></section>

    <section className="analytics-grid distribution-row"><div className="distribution-panel glass-panel"><div className="panel-title-row"><div><span className="panel-kicker">UNDERWRITING SUPPLY</span><h2>Bonded collateral by agent</h2></div><button onClick={() => onNavigate('directory')}>View directory →</button></div><div className="collateral-bars">{[...MOCK_AGENTS].sort((a,b) => b.collateralUsdc - a.collateralUsdc).map((agent) => <div className="collateral-bar" key={agent.id}><div className="bar-label"><span>{agent.avatar} {agent.name}</span><strong>${(agent.collateralUsdc / 1000).toFixed(0)}k</strong></div><div className="bar-track"><i style={{ width: `${(agent.collateralUsdc / 500000) * 100}%` }} /></div></div>)}</div></div>
    <div className="stylus-benchmark glass-panel"><span className="panel-kicker">ARBITRUM STYLUS</span><h2>Risk computation gas benchmark</h2><p>Weighted risk scoring via Rust WASM versus a comparable Solidity EVM execution path.</p><div className="benchmark-bars"><div><div><span>Stylus Rust</span><strong>38k gas</strong></div><i className="stylus-gas" /></div><div><div><span>Solidity EVM</span><strong>412k gas</strong></div><i className="evm-gas" /></div></div><div className="benchmark-result"><strong>10.8x</strong><span>lower gas for compute-heavy scoring</span></div></div></section>
  </div></main>;
};
