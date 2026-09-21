# RBD Shield — Threat Model & Security Analysis

**Author:** rbd3  
**Project:** RBD Shield — Autonomous Risk-Underwriting Protocol  
**Date:** 2026-09-21  

---

## 1. Overview & Trust Assumptions

RBD Shield handles user funds and agent collateral. The security model balances autonomous on-chain execution with strict collateral solvency invariants.

### Core Security Objectives:
1. **Solvency Preservation:** The protocol must never become undercollateralized. `totalDeposited >= lockedAmount + totalClaimsPaid` must hold strictly for every individual agent vault.
2. **Deterministic Claims Execution:** Approved claims must only disburse from the specific underwriting agent's locked reserve without contaminating other agents' capital.
3. **Double-Spend Immunity:** Coverage policies must transition to `Claimed` or `Expired` atomically to prevent repeated payouts for a single bond.

---

## 2. Threat Vectors & Mitigations

### Threat 1: Reentrancy Attack on Claim Payouts
- **Vector:** An attacker provides a malicious smart contract recipient for a claim payout. When `transfer` is executed, the contract re-enters `ClaimsProcessor` or `VaultManager` to drain additional funds.
- **Mitigation:**
  - `ReentrancyGuard` applied to `VaultManager.executePayout`, `CoverageManager.purchaseCoverage`, and `ClaimsProcessor.approveClaim`.
  - State update (`claim.status = Paid`, `vault.lockedAmount -= amount`, `vault.totalClaimsPaid += amount`) happens strictly before external ERC20 transfer (Check-Effects-Interactions pattern).

### Threat 2: Vault Over-Subscription / Over-Commitment
- **Vector:** An agent with $10,000 USDC available creates terms with $5,000 max payout each, and 10 users purchase simultaneously, creating $50,000 in liability against $10,000 collateral.
- **Mitigation:**
  - In `CoverageManager.purchaseCoverage()`, `vaultManager.lockCollateral(term.agent, term.maxPayout)` is executed atomically in the purchase transaction.
  - If `available < term.maxPayout`, the transaction reverts immediately with `InsufficientAvailableCollateral`. The protocol guarantees 100% full-reserve backing per active policy.

### Threat 3: Replay / Multiple Claims on Single Bond
- **Vector:** A user whose claim was paid submits another claim using the same policy ID.
- **Mitigation:**
  - `ClaimsProcessor.policyToClaim[policyId]` enforces that exactly one claim can ever be submitted per policy ID.
  - When approved, `CoverageManager.markPolicyClaimed(policyId)` transitions status to `Claimed`, rendering subsequent calls invalid.

### Threat 4: Premature Collateral Withdrawal by Underwriting Agent
- **Vector:** An agent sees an impending failure and attempts to withdraw their staked collateral before users can claim.
- **Mitigation:**
  - `VaultManager.withdraw()` only allows withdrawing `availableCollateral = totalDeposited - lockedAmount - totalClaimsPaid`.
  - The collateral backing active policies is strictly locked and cannot be withdrawn until policies expire or resolve.

### Threat 5: Oracle & Attestation Manipulation
- **Vector:** A compromised or malicious attester approves fraudulent claims.
- **Mitigation:**
  - Attestation is segregated under `ATTESTER_ROLE`.
  - Claims require an on-chain `evidenceHash` (cryptographic digest of telemetry or transaction execution proofs), enabling retrospective auditing and slashing of fraudulent attesters.
