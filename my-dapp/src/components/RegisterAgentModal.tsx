import React, { useState } from 'react';
import { parseUnits } from 'viem';
import { useAccount, useChainId, usePublicClient, useWriteContract } from 'wagmi';
import { agentRegistryAbi, contractsForChain, erc20Abi, vaultManagerAbi } from '../lib/contracts';
import './RegisterAgentModal.css';

interface RegisterAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const errorMessage = (error: unknown) => (typeof error === 'object' && error !== null && 'shortMessage' in error && typeof (error as { shortMessage?: unknown }).shortMessage === 'string') ? (error as { shortMessage: string }).shortMessage : error instanceof Error ? error.message : 'Transaction failed. Please try again.';

export const RegisterAgentModal: React.FC<RegisterAgentModalProps> = ({ isOpen, onClose }) => {
  const { address } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const [agentName, setAgentName] = useState('');
  const [collateralAmount, setCollateralAmount] = useState('1000');
  const [slaCondition, setSlaCondition] = useState('');
  const [step, setStep] = useState<'form' | 'submitting' | 'success'>('form');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const contracts = contractsForChain(chainId);
    if (!address || chainId !== 421614 || !publicClient || !contracts.usdc || !contracts.vaultManager || !contracts.agentRegistry) {
      setError('Connect the agent wallet on Arbitrum Sepolia before registering.');
      return;
    }
    try {
      setError(null);
      setStep('submitting');
      const amount = parseUnits(collateralAmount, 6);
      const [isRegistered, availableCollateral] = await Promise.all([
        publicClient.readContract({ address: contracts.agentRegistry, abi: agentRegistryAbi, functionName: 'isActiveAgent', args: [address] }),
        publicClient.readContract({ address: contracts.vaultManager, abi: vaultManagerAbi, functionName: 'getAvailableCollateral', args: [address] }),
      ]);
      if (isRegistered) throw new Error('This wallet is already registered as an active agent.');
      // Resume safely after an interrupted UI session: only fund the vault when needed.
      if (availableCollateral < amount) {
        const gasPrice = (await publicClient.getGasPrice()) * 2n;
        const feeOverrides = { gasPrice };
        const approveHash = await writeContractAsync({ address: contracts.usdc, abi: erc20Abi, functionName: 'approve', args: [contracts.vaultManager, amount], ...feeOverrides });
        await publicClient.waitForTransactionReceipt({ hash: approveHash });
        const depositHash = await writeContractAsync({ address: contracts.vaultManager, abi: vaultManagerAbi, functionName: 'deposit', args: [amount], ...feeOverrides });
        await publicClient.waitForTransactionReceipt({ hash: depositHash });
      }
      const gasPrice = (await publicClient.getGasPrice()) * 2n;
      const feeOverrides = { gasPrice };
      const metadataURI = `ipfs://rbd-shield/${encodeURIComponent(agentName)}?sla=${encodeURIComponent(slaCondition)}`;
      const registerHash = await writeContractAsync({ address: contracts.agentRegistry, abi: agentRegistryAbi, functionName: 'registerAgent', args: [metadataURI], ...feeOverrides });
      await publicClient.waitForTransactionReceipt({ hash: registerHash });
      setTxHash(registerHash);
      setStep('success');
    } catch (caught) {
      setStep('form');
      setError(errorMessage(caught));
    }
  };

  return <div className="modal-backdrop" onClick={onClose} role="presentation"><div className="modal-container glass-panel" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="register-modal-title"><div className="modal-header"><div className="modal-header-left"><span className="modal-tag">DEVELOPER SUPPLY-SIDE</span><h3 className="modal-title" id="register-modal-title">Register Autonomous AI Agent & Stake Bond</h3></div><button className="btn-close" aria-label="Close modal" onClick={onClose}>✕</button></div>{step === 'form' ? <form onSubmit={handleSubmit} className="modal-form"><p className="modal-instruction">This sends three wallet transactions: USDC approval, vault deposit, and <code>AgentRegistry.registerAgent</code>.</p><div className="form-group"><label>Agent Name & Identifier</label><input type="text" required value={agentName} onChange={(e) => setAgentName(e.target.value)} className="modal-input" /></div><div className="form-group"><label>Agent Operator Address (connected wallet)</label><input type="text" readOnly value={address ?? 'Connect wallet to populate'} className="modal-input font-mono" aria-describedby="operator-address-hint" /><span className="input-hint" id="operator-address-hint">Automatically set to the wallet signing the registration transaction.</span></div><div className="form-group"><label>Initial Collateral Deposit (USDC)</label><div className="input-with-currency"><input type="number" min="1000" step="1" required value={collateralAmount} onChange={(e) => setCollateralAmount(e.target.value)} className="modal-input font-mono" /><span className="currency-badge">USDC</span></div></div><div className="form-group"><label>Parametric SLA Failure Condition</label><input type="text" required placeholder="e.g. Execution latency exceeds 5 blocks for 3 consecutive transactions" value={slaCondition} onChange={(e) => setSlaCondition(e.target.value)} className="modal-input" /></div>{error && <p className="field-error" role="alert">{error}</p>}<div className="modal-actions"><button type="button" className="btn-cancel" onClick={onClose}>Cancel</button><button type="submit" className="btn-primary-cyan">Approve, Deposit & Register</button></div></form> : step === 'submitting' ? <div className="modal-success-view text-center"><div className="spinner-glow" /><h4 className="success-title">Confirm wallet transactions</h4><p className="success-desc">Waiting for the approval, deposit, and registration receipts.</p></div> : <div className="modal-success-view text-center"><div className="success-icon">✓</div><h4 className="success-title">Agent Registered On-Chain</h4><p className="success-desc">The vault deposit and agent registration were confirmed.</p><code className="text-emerald">{txHash}</code><button className="btn-primary-cyan" onClick={onClose}>Done</button></div>}</div></div>;
};
