import { useMemo, useState } from 'react';
import { MOCK_AGENTS } from '../data/mockAgents';
import './ClaimsPage.css';

type ClaimState = 'Evidence Verification' | 'Payout Disbursed';
type Claim = { id: string; policyId: string; agentId: string; amount: number; submitted: string; evidence: string; state: ClaimState; };
const eligiblePolicies = [
  { id: 'POL-84920', agentId: 'agent-alpha-arb', maximum: 25000, trigger: 'Drawdown > 5.0% over rolling 72-hour window' },
  { id: 'POL-79104', agentId: 'agent-sentinel-perp', maximum: 10000, trigger: 'Unscheduled liquidation due to bot execution delay' },
];
const initialClaims: Claim[] = [
  { id: 'CLM-1048', policyId: 'POL-68402', agentId: 'agent-momentum-sniper', amount: 2500, submitted: 'Sep 23, 2026 · 14:22 UTC', evidence: 'bafybeigdyrzt...8k91', state: 'Evidence Verification' },
  { id: 'CLM-1031', policyId: 'POL-52277', agentId: 'agent-vault-compounder', amount: 15000, submitted: 'Aug 15, 2026 · 09:06 UTC', evidence: 'bafybeihgawq...7fa2', state: 'Payout Disbursed' },
];

export const ClaimsPage = ({ onNavigate }: { onNavigate: (tab: string) => void }) => {
  const [claims, setClaims] = useState(initialClaims);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPolicyId, setSelectedPolicyId] = useState(eligiblePolicies[0].id);
  const [amount, setAmount] = useState(String(eligiblePolicies[0].maximum));
  const [evidence, setEvidence] = useState('');
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const selectedPolicy = useMemo(() => eligiblePolicies.find((policy) => policy.id === selectedPolicyId)!, [selectedPolicyId]);
  const numericAmount = Number(amount) || 0;
  const evidenceValid = evidence.trim().length >= 16;
  const amountValid = numericAmount > 0 && numericAmount <= selectedPolicy.maximum;

  const changePolicy = (policyId: string) => {
    const policy = eligiblePolicies.find((item) => item.id === policyId)!;
    setSelectedPolicyId(policyId);
    setAmount(String(policy.maximum));
  };
  const submitClaim = () => {
    if (!evidenceValid || !amountValid) return;
    const claim: Claim = { id: `CLM-${1050 + claims.length}`, policyId: selectedPolicy.id, agentId: selectedPolicy.agentId, amount: numericAmount, submitted: 'Just now', evidence: `${evidence.slice(0, 12)}...`, state: 'Evidence Verification' };
    setClaims((current) => [claim, ...current]);
    setSubmittedId(claim.id);
    setDrawerOpen(false);
    setEvidence('');
  };
  const totalPaid = claims.filter((claim) => claim.state === 'Payout Disbursed').reduce((sum, claim) => sum + claim.amount, 0);

  return <main className="claims-page"><div className="container">
    <section className="claims-heading"><div><div className="claims-eyebrow"><span /> PARAMETRIC SETTLEMENT RAIL</div><h1>Claims</h1><p>Submit verifiable SLA-breach evidence and follow settlement from the protocol attester through the bonded vault.</p></div><button className="claims-submit" onClick={() => setDrawerOpen(true)}>Submit new claim <span aria-hidden="true">→</span></button></section>
    {submittedId && <div className="claims-notice" role="status"><strong>{submittedId}</strong> submitted. Evidence verification has started.</div>}
    <section className="claims-overview"><div className="claims-overview-card glass-panel"><span>Total claims paid</span><strong className="text-emerald">${totalPaid.toLocaleString()}</strong><small>From verified bonded-vault disbursements</small></div><div className="claims-overview-card glass-panel"><span>Median settlement</span><strong>18 min</strong><small>From attestation to on-chain settlement</small></div><div className="claims-overview-card glass-panel"><span>In review</span><strong className="text-cyan">{claims.filter((claim) => claim.state === 'Evidence Verification').length}</strong><small>Waiting on authorized attester verification</small></div><div className="claims-overview-card glass-panel"><span>Vault solvency</span><strong className="text-emerald">100%</strong><small>All eligible payouts remain collateral-backed</small></div></section>
    <section className="claims-main"><div className="claims-intro glass-panel"><div className="claims-intro-icon">⌁</div><div><h2>Evidence-led, collateral-backed settlement</h2><p>Under MVP rules, an authorized protocol attester verifies the evidence hash. Eligible claims are then disbursed automatically from the underwriting agent’s bonded vault.</p></div><button onClick={() => onNavigate('coverage')}>View my coverage</button></div>
    <div className="claims-ledger-heading"><div><h2>Claim status timeline</h2><p>Each step has an on-chain audit trail.</p></div><span>{claims.length} claim records</span></div>
    <div className="claims-ledger">{claims.map((claim) => { const agent = MOCK_AGENTS.find((item) => item.id === claim.agentId)!; const settled = claim.state === 'Payout Disbursed'; return <article className="claim-card glass-panel" key={claim.id}><div className="claim-card-top"><div className="claim-agent"><div>{agent.avatar}</div><div><h3>{agent.name}</h3><p>{claim.policyId} · {claim.submitted}</p></div></div><div className={`claim-state ${settled ? 'settled' : 'review'}`}>{settled ? 'Payout Disbursed' : 'Evidence Verification'}</div></div><div className="claim-meta"><div><span>Requested payout</span><strong className="text-cyan">${claim.amount.toLocaleString()} USDC</strong></div><div><span>Evidence hash</span><code>{claim.evidence}</code></div><div><span>Bonded vault</span><code>{agent.vaultAddress.slice(0, 10)}...{agent.vaultAddress.slice(-4)}</code></div></div><div className="claim-timeline"><div className="timeline-step complete"><i>1</i><div><strong>Submitted</strong><span>Evidence hash recorded</span></div></div><div className={`timeline-line ${settled ? 'complete' : ''}`} /><div className={`timeline-step ${settled ? 'complete' : 'current'}`}><i>2</i><div><strong>Evidence verification</strong><span>{settled ? 'Attester verification completed' : 'Authorized attester reviewing proof'}</span></div></div><div className={`timeline-line ${settled ? 'complete' : ''}`} /><div className={`timeline-step ${settled ? 'complete' : ''}`}><i>3</i><div><strong>Payout disbursed</strong><span>{settled ? 'Transferred from bonded vault' : 'Awaiting eligible verification'}</span></div></div></div></article>; })}</div></section>
  </div>{drawerOpen && <div className="claim-drawer-backdrop" onClick={() => setDrawerOpen(false)} role="presentation"><aside className="claim-drawer" role="dialog" aria-modal="true" aria-labelledby="new-claim-title" onClick={(event) => event.stopPropagation()}><div className="drawer-header"><div><span>NEW PARAMETRIC CLAIM</span><h2 id="new-claim-title">Submit breach evidence</h2></div><button onClick={() => setDrawerOpen(false)} aria-label="Close claim form">×</button></div><div className="drawer-body"><label>Eligible policy<select value={selectedPolicyId} onChange={(event) => changePolicy(event.target.value)}>{eligiblePolicies.map((policy) => { const agent = MOCK_AGENTS.find((item) => item.id === policy.agentId)!; return <option key={policy.id} value={policy.id}>{policy.id} · {agent.name}</option>; })}</select></label><div className="drawer-policy-detail"><span>Coverage maximum</span><strong>${selectedPolicy.maximum.toLocaleString()} USDC</strong><p>{selectedPolicy.trigger}</p></div><label>Claim amount (USDC)<input type="number" min="1" max={selectedPolicy.maximum} value={amount} onChange={(event) => setAmount(event.target.value)} />{!amountValid && <small className="field-error">Enter an amount between $1 and ${selectedPolicy.maximum.toLocaleString()}.</small>}</label><label>IPFS CID or cryptographic evidence hash<textarea value={evidence} onChange={(event) => setEvidence(event.target.value)} placeholder="bafybei... or 0x..." rows={4} />{evidence && !evidenceValid && <small className="field-error">Add a valid evidence identifier (at least 16 characters).</small>}</label><div className="evidence-checklist"><strong>Evidence record</strong><span>✓ Links to the active policy</span><span>✓ Immutable hash stored with the claim</span><span>✓ Reviewed by the authorized attester</span></div><button className="drawer-submit" disabled={!evidenceValid || !amountValid} onClick={submitClaim}>Submit claim for verification</button></div></aside></div>}</main>;
};
