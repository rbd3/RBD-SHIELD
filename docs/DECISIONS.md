# RBD Shield — Architectural Decision Records (ADR)

**Author:** rbd3  
**Project:** RBD Shield — Autonomous Risk-Underwriting Protocol  
**Date:** 2026-09-21  

---

## ADR-001: Parametric Performance Bond vs. Indemnity Insurance

### 1. The Problem
AI agents operating autonomously in DeFi carry execution, algorithmic, and financial risks. Traditional indemnity insurance requires subjective loss assessments, claims adjusters, and complex legal structures that trigger regulatory licensing (e.g. insurance broker/underwriter regulations).

### 2. Options Considered
- **Option A: Traditional Indemnity Insurance Protocol.** Subjective claims filed after financial losses, adjusted by a DAO or decentralized committee.
- **Option B: Pure Reputation Staking (Slashing without Payouts).** Malicious or failing agents get slashed, but victimized users receive no restitution.
- **Option C: Parametric Performance Bond Model.** Agents lock verifiable collateral in on-chain vaults against predefined SLA terms. Verifiable metric violations trigger deterministic payouts to bonded users.

### 3. Selected Approach
**Option C: Parametric Performance Bond Model.**

### 4. Reasoning
- Avoids regulatory insurance classification by structuring the product as a bilateral performance bond / escrowed SLA guarantee.
- Deterministic payouts remove lengthy subjective dispute periods, which is vital for automated agent ecosystems.
- Provides immediate financial recourse rather than mere post-hoc slashing.

### 5. Trade-offs
- Parametric bonds only cover conditions that can be verifiably defined (e.g., drawdown, downtime, contract reverts), not arbitrary subjective dissatisfaction.
- Full collateralization is required upfront, reducing leverage.

### 6. Consequences
- Contracts must rigorously segregate `lockedAmount` from `availableAmount`.
- A 100% reserve ratio must be preserved per active bond to eliminate bank-run dynamics.

### 7. Alternatives for Future Versions
- Pooled mutual risk pools (Nexus Mutual style) or fractional undercollateralization once historical actuarial data for agents is mature.

---

## ADR-002: Hybrid Architecture (Solidity Core + Stylus Risk Engine)

### 1. The Problem
Arbitrum Nitro provides both EVM compatibility and the Arbitrum Stylus WASM runtime. Core custody and ERC20 operations benefit from battle-tested Solidity standards and OpenZeppelin libraries, whereas numerical risk modeling, fixed-point actuarial math, and matrix calculations in the EVM suffer from high gas consumption and risk of arithmetic overflow.

### 2. Options Considered
- **Option A: 100% Solidity.** Implement everything in Solidity.
- **Option B: 100% Stylus (Rust).** Implement all contracts, vault custody, and token interactions in Rust Stylus.
- **Option C: Hybrid (Solidity Core + Stylus Coprocessor/Risk Engine).** Solidity manages vaults, tokens, access control, and claims; Rust Stylus computes risk scores and multi-factor models.

### 3. Selected Approach
**Option C: Hybrid Architecture.**

### 4. Reasoning
- Solidity + OpenZeppelin minimizes security risk on asset custody and token transfers.
- Rust Stylus provides order-of-magnitude gas savings for multi-factor risk scoring and fixed-point math.
- Uniquely highlights Arbitrum Orbit and Stylus capabilities for the hackathon judging criteria.

### 5. Trade-offs
- Requires maintaining two toolchains (Foundry + Cargo Stylus).

### 6. Consequences
- Clean ABI boundary between Solidity and Rust contracts.
- Deterministic interfaces with integer-scaled basis points (BPS) or 18-decimal fixed point numbers.

### 7. Alternatives for Future Versions
- Full Stylus native contracts for the entire protocol when Stylus tooling reaches equivalent maturity to OpenZeppelin for Solidity.

---

## ADR-003: Admin-Attested Performance Oracle for MVP

### 1. The Problem
Evaluating complex off-chain metrics (e.g., API latency, off-chain order execution, CEX-DEX arbitrage drawdowns) requires external oracles. Fully decentralized ZK-oracles or Chainlink Functions add significant integration overhead for a 2-week hackathon timeline.

### 2. Options Considered
- **Option A: Full Chainlink Functions / Custom ZK Oracles.**
- **Option B: On-Chain Mock Data Only.** No external performance data.
- **Option C: Role-Based Admin Attester Pattern.** Defined `ATTESTER_ROLE` that submits signed performance reports, with full transparent disclosure.

### 3. Selected Approach
**Option C: Role-Based Admin Attester Pattern.**

### 4. Reasoning
- Enables full end-to-end testing and demo presentation of the complete claims and risk-scoring cycle.
- Clearly segregated under an `ATTESTER_ROLE` so it can be swapped for Chainlink or UMA without redesigning core vault contracts.

### 5. Trade-offs
- Introduces centralization in the MVP demo, which must be clearly documented.

### 6. Consequences
- Role-based permissions in `RBDShieldCore`.

### 7. Alternatives for Future Versions
- Integration with Chainlink Functions, Pyth Network benchmarks, or UMA optimistic oracle.
