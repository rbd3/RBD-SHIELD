import { useMemo, useState } from 'react';
import { MOCK_AGENTS } from '../data/mockAgents';
import './MyCoveragePage.css';

type PolicyStatus = 'Active' | 'Claim Pending' | 'Paid Out' | 'Expired';
type CoveragePolicy = { id: string; agentId: string; term: string; coveredAmount: number; premium: number; status: PolicyStatus; expiresAt: string; txHash: string; claimAmount?: number };

const policies: CoveragePolicy[] = [
  { id: 'POL-84920', agentId: 'agent-alpha-arb', term: 'Institutional Treasury SLA', coveredAmount: 25000, premium: 320, status: 'Active', expiresAt: '2026-10-18T20:00:00Z', txHash: '0x4a92...e814' },
  { id: 'POL-79104', agentId: 'agent-sentinel-perp', term: 'Liquidation Shield SLA', coveredAmount: 10000, premium: 160, status: 'Active', expiresAt: '2026-10-01T12:00:00Z', txHash: '0x87d1...3f20' },
  { id: 'POL-68402', agentId: 'agent-momentum-sniper', term: 'Volatility Cap SLA', coveredAmount: 2500, premium: 95, status: 'Claim Pending', expiresAt: '2026-09-28T15:00:00Z', txHash: '0x1bf3...4aa2', claimAmount: 2500 },
  { id: 'POL-52277', agentId: 'agent-vault-compounder', term: 'Compound Accuracy SLA', coveredAmount: 15000, premium: 210, status: 'Paid Out', expiresAt: '2026-08-14T16:00:00Z', txHash: '0xd192...be91', claimAmount: 15000 },
  { id: 'POL-41982', agentId: 'agent-keeper-bot', term: 'Latency Guarantee SLA', coveredAmount: 3000, premium: 60, status: 'Expired', expiresAt: '2026-09-04T12:00:00Z', txHash: '0x991d...04c8' },
];
const tabs: Array<'All' | PolicyStatus> = ['All', 'Active', 'Claim Pending', 'Paid Out', 'Expired'];
const formatRemaining = (date: string) => { const remaining = new Date(date).getTime() - Date.now(); if (remaining <= 0) return 'Term ended'; const days = Math.floor(remaining / 86400000); const hours = Math.floor((remaining % 86400000) / 3600000); return days > 0 ? `${days}d ${hours}h remaining` : `${hours}h remaining`; };

export const MyCoveragePage = ({ onNavigate }: { onNavigate: (tab: string) => void }) => {
  const [activeTab, setActiveTab] = useState<'All' | PolicyStatus>('All');
  const [copiedPolicy, setCopiedPolicy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const visiblePolicies = useMemo(() => policies.filter((policy) => activeTab === 'All' || policy.status === activeTab), [activeTab]);
  const activePolicies = policies.filter((policy) => policy.status === 'Active');
  const protectedValue = activePolicies.reduce((total, policy) => total + policy.coveredAmount, 0);
  const paidValue = policies.reduce((total, policy) => total + (policy.status === 'Paid Out' ? policy.claimAmount ?? 0 : 0), 0);
  const copyPolicyId = (policyId: string) => { navigator.clipboard?.writeText(policyId); setCopiedPolicy(policyId); window.setTimeout(() => setCopiedPolicy(null), 1800); };
  const handleClaim = (policy: CoveragePolicy) => { setNotice(`${policy.id} is ready for an evidence-backed parametric claim.`); window.setTimeout(() => onNavigate('claims'), 750); };

  return <main className="coverage-page"><div className="container">
    <section className="coverage-heading"><div><div className="coverage-eyebrow"><span className="coverage-live-dot" /> YOUR BONDED POSITIONS</div><h1>My Coverage</h1><p>Track every active performance bond, its vault backing, and any eligible parametric claim in one place.</p></div><button className="coverage-browse-btn" onClick={() => onNavigate('directory')}>Browse agents <span aria-hidden="true">→</span></button></section>
    {notice && <div className="coverage-notice" role="status">{notice}</div>}
    <section className="coverage-summary" aria-label="Coverage summary"><div className="coverage-summary-card glass-panel"><span>Active positions</span><strong>{activePolicies.length}</strong><small>Currently backed by bonded vaults</small></div><div className="coverage-summary-card glass-panel"><span>Total protected value</span><strong className="text-cyan">${protectedValue.toLocaleString()}</strong><small>Across active performance bonds</small></div><div className="coverage-summary-card glass-panel"><span>Expired policies</span><strong>{policies.filter((p) => p.status === 'Expired').length}</strong><small>Available in your on-chain history</small></div><div className="coverage-summary-card glass-panel"><span>Settled claims</span><strong className="text-emerald">${paidValue.toLocaleString()}</strong><small>Verified payouts from bonded vaults</small></div></section>
    <section className="coverage-list-section"><div className="coverage-list-header"><div><h2>Coverage positions</h2><p>Policy records are retained after expiry and settlement for auditability.</p></div><div className="coverage-tabs" role="tablist" aria-label="Policy status">{tabs.map((tab) => <button key={tab} role="tab" aria-selected={activeTab === tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>{tab}</button>)}</div></div>
    <div className="coverage-policies">{visiblePolicies.map((policy) => { const agent = MOCK_AGENTS.find((item) => item.id === policy.agentId)!; const active = policy.status === 'Active'; const remaining = active ? formatRemaining(policy.expiresAt) : policy.status === 'Expired' ? 'Term ended' : policy.status; return <article className="coverage-policy glass-panel" key={policy.id}><div className="policy-agent"><div className="policy-avatar">{agent.avatar}</div><div><div className="policy-title-row"><h3>{agent.name}</h3><span className={`policy-status ${policy.status.toLowerCase().replace(' ', '-')}`}>{policy.status}</span></div><p>{policy.term} <span>·</span> {agent.chain}</p></div></div><div className="policy-details"><div><span>Policy ID</span><button onClick={() => copyPolicyId(policy.id)} className="policy-id">#{policy.id} {copiedPolicy === policy.id ? 'Copied' : '⧉'}</button></div><div><span>Covered amount</span><strong className="text-cyan">${policy.coveredAmount.toLocaleString()} USDC</strong></div><div><span>Premium paid</span><strong>${policy.premium.toLocaleString()} USDC</strong></div><div><span>{active ? 'Expiry' : 'Policy status'}</span><strong className={active ? 'text-emerald' : ''}>{remaining}</strong></div></div>{active && <div className="policy-expiry"><div><span>Term progress</span><strong>{remaining}</strong></div><div className="expiry-track"><i /></div></div>}<div className="policy-actions">{policy.status === 'Claim Pending' && <button className="policy-secondary" onClick={() => onNavigate('claims')}>View claim status</button>}{policy.status === 'Paid Out' && <button className="policy-secondary" onClick={() => setNotice(`Settlement ${policy.txHash} verified on-chain.`)}>View settlement</button>}{policy.status === 'Expired' && <span className="policy-inactive">Coverage term complete</span>}{active && <button className="policy-claim" onClick={() => handleClaim(policy)}>File parametric claim <span aria-hidden="true">→</span></button>}</div></article>; })}</div></section>
  </div></main>;
};
