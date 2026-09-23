import React, { useState } from 'react';
import './RegisterAgentModal.css';

interface RegisterAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegisterAgentModal: React.FC<RegisterAgentModalProps> = ({ isOpen, onClose }) => {
  const [agentName, setAgentName] = useState('');
  const [operatorAddress, setOperatorAddress] = useState('');
  const [collateralAmount, setCollateralAmount] = useState('10000');
  const [slaCondition, setSlaCondition] = useState('');
  const [step, setStep] = useState<'form' | 'success'>('form');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('success');
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal-container glass-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="register-modal-title"
      >
        <div className="modal-header">
          <div className="modal-header-left">
            <span className="modal-tag">DEVELOPER SUPPLY-SIDE</span>
            <h3 className="modal-title" id="register-modal-title">Register Autonomous AI Agent & Stake Bond</h3>
          </div>
          <button className="btn-close" aria-label="Close modal" onClick={onClose}>✕</button>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="modal-form">
            <p className="modal-instruction">
              Stake on-chain collateral into <code>VaultManager</code> to issue guaranteed SLAs. 
              Your agent will be scored on-chain by the Arbitrum Stylus Risk Engine.
            </p>

            <div className="form-group">
              <label>Agent Name & Identifier</label>
              <input
                type="text"
                required
                placeholder="e.g. Arbitrum FlashRebalancer-01"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                className="modal-input"
              />
            </div>

            <div className="form-group">
              <label>Agent Operator Address (EVM)</label>
              <input
                type="text"
                required
                placeholder="0x..."
                value={operatorAddress}
                onChange={(e) => setOperatorAddress(e.target.value)}
                className="modal-input font-mono"
              />
            </div>

            <div className="form-group">
              <label>Initial Collateral Deposit (USDC)</label>
              <div className="input-with-currency">
                <input
                  type="number"
                  min="1000"
                  step="500"
                  required
                  value={collateralAmount}
                  onChange={(e) => setCollateralAmount(e.target.value)}
                  className="modal-input font-mono"
                />
                <span className="currency-badge">USDC</span>
              </div>
              <span className="input-hint">Minimum required: 1,000 USDC. Locked 1:1 against active coverage.</span>
            </div>

            <div className="form-group">
              <label>Parametric SLA Failure Condition (Trigger)</label>
              <input
                type="text"
                required
                placeholder="e.g. Drawdown > 5% within 1 hour or latency > 5 blocks"
                value={slaCondition}
                onChange={(e) => setSlaCondition(e.target.value)}
                className="modal-input"
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary-cyan">
                <span>Approve & Stake {Number(collateralAmount || 0).toLocaleString()} USDC</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="modal-success-view text-center">
            <div className="success-icon">✓</div>
            <h4 className="success-title">Agent Registered Successfully!</h4>
            <p className="success-desc">
              Your agent <strong>{agentName || 'Agent'}</strong> has been registered in <code>AgentRegistry</code> with <strong>${Number(collateralAmount).toLocaleString()} USDC</strong> collateral deposited into <code>VaultManager</code>.
            </p>
            <div className="stylus-registered-pill font-mono">
              Initial Stylus Risk Score: 850/1000 (Low Risk Tier)
            </div>
            <button className="btn-primary-cyan" onClick={() => { setStep('form'); onClose(); }}>
              Done & View in Directory
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
