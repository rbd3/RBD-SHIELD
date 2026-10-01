import { useEffect, useState } from 'react';
import { keccak256, parseUnits, toHex } from 'viem';
import { useAccount, useChainId, usePublicClient, useWriteContract } from 'wagmi';
import { claimsProcessorAbi, contractsForChain } from '../lib/contracts';
import { useWallet } from '../context/WalletContext';
import { WalletGate } from '../components/WalletGate';
import './ClaimsPage.css';

const errorMessage = (error: unknown) => (typeof error === 'object' && error !== null && 'shortMessage' in error && typeof (error as { shortMessage?: unknown }).shortMessage === 'string') ? (error as { shortMessage: string }).shortMessage : error instanceof Error ? error.message : 'Claim submission failed.';

export const ClaimsPage = ({ onNavigate }: { onNavigate: (tab: string) => void }) => {
  const { account, demoMode, setDemoMode } = useWallet();
  const { address } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const [policyId, setPolicyId] = useState('');
  const [amount, setAmount] = useState('');
  const [evidence, setEvidence] = useState('');
  const [busy, setBusy] = useState(false);
  const [hash, setHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Failure Claims | RBD Shield';
    return () => {
      document.title = 'RBD Shield';
    };
  }, []);

  const submitClaim = async (event: React.FormEvent) => {
    event.preventDefault();
    const contracts = contractsForChain(chainId);
    if (!address || chainId !== 421614 || !publicClient || !contracts.claimsProcessor) {
      setError('Connect the policyholder wallet on Arbitrum Sepolia first.');
      return;
    }
    try {
      setBusy(true); setError(null); setHash(null);
      const claimHash = await writeContractAsync({ address: contracts.claimsProcessor, abi: claimsProcessorAbi, functionName: 'submitClaim', args: [BigInt(policyId), parseUnits(amount, 6), keccak256(toHex(evidence))] });
      await publicClient.waitForTransactionReceipt({ hash: claimHash });
      setHash(claimHash);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally { setBusy(false); }
  };

  if (!account && !demoMode) return <WalletGate title="Your claim records" description="Connect the wallet that owns the policy to submit a live claim." />;
  return <main className="claims-page"><div className="container">{demoMode && <div className="demo-data-banner">DEMO MODE is read-only. <button onClick={() => setDemoMode(false)}>Exit demo</button></div>}<section className="claims-heading"><div><div className="claims-eyebrow"><span /> FAILURE SETTLEMENT RAIL</div><h1>Failure Claims</h1><p>Report a covered failure, outage, or SLA breach. Submit your evidence hash so an authorized attester can verify the incident and trigger the bonded-vault payout.</p></div><button className="claims-submit" onClick={() => onNavigate('coverage')}>View coverage <span aria-hidden="true">→</span></button></section><section className="claims-main"><form className="claim-drawer glass-panel" onSubmit={submitClaim}><div className="drawer-header"><div><span>LIVE ARBITRUM SEPOLIA CLAIM</span><h2>Submit failure evidence</h2></div></div><div className="drawer-body"><label>On-chain policy ID<input required min="1" type="number" value={policyId} onChange={(event) => setPolicyId(event.target.value)} placeholder="e.g. 1" /></label><label>Claim amount (mock USDC)<input required min="0.000001" step="0.000001" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} /></label><label>Evidence text or CID<textarea required minLength={16} value={evidence} onChange={(event) => setEvidence(event.target.value)} placeholder="IPFS CID, telemetry proof, or breach report" rows={5} /></label><div className="evidence-checklist"><strong>What is sent on-chain</strong><span>✓ keccak256 hash of your evidence text</span><span>✓ Policy ID and requested amount</span><span>✓ Transaction signed by the policyholder wallet</span></div>{error && <p className="field-error" role="alert">{error}</p>}{hash && <div className="claims-notice" role="status">Claim submitted and confirmed: <code>{hash}</code></div>}<button className="drawer-submit" disabled={busy || demoMode}>{busy ? 'Waiting for confirmation…' : 'Submit failure claim'}</button></div></form></section></div></main>;
};
