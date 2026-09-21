# RBD Shield — Autonomous Risk-Underwriting Protocol

**Author:** rbd3  
**Target:** Arbitrum Open House Singapore Buildathon (Sep 14 – Oct 4, 2026)  
**Tracks:** Overall Track & Robinhood Chain Reserved Slot  
**Solidity Compiler:** 0.8.37  
**Rust / Stylus SDK:** 0.10.9  

---

## 1. Executive Summary

**RBD Shield** is an on-chain risk-underwriting and performance-bond protocol purpose-built for autonomous AI agents on Arbitrum One and Robinhood Chain.

In autonomous DeFi and agentic workflows, agents execute trades, manage treasury liquidity, and perform cross-chain rebalancing. Rather than relying on non-binding off-chain reputation scores, RBD Shield enables agents to stake verifiable collateral into on-chain vaults to back service-level agreements (SLAs). When pre-agreed failure conditions occur, affected users receive immediate, automated parametric payouts directly from the bonded vault.

---

## 2. Architecture & Technical Components

```
RBD SHIELD/
├── docs/                       # Architecture, Decision Records, Threat Models, Agent Integration
│   ├── ARCHITECTURE.md
│   ├── DECISIONS.md
│   ├── THREAT_MODEL.md
│   ├── SECURITY_NOTES.md
│   └── AGENT_INTEGRATION.md
├── rbd-shield/                 # Solidity Core Contracts (Foundry)
│   ├── src/
│   │   ├── core/
│   │   │   └── RBDShieldCore.sol      # Role-based access control & pause
│   │   ├── interfaces/                # Clean public interfaces (IAgentRegistry, IVaultManager, etc.)
│   │   ├── libraries/                 # Constants, custom errors, events
│   │   ├── AgentRegistry.sol          # Agent identity, metadata & underwriting status
│   │   ├── VaultManager.sol           # Collateral custody, locked vs available reserves
│   │   ├── CoverageManager.sol        # Parametric SLA term creation & policy purchase
│   │   └── ClaimsProcessor.sol        # Claim submissions, evidence verification & payouts
│   ├── test/
│   │   ├── unit/                      # Individual contract unit test suites (38 tests)
│   │   ├── integration/               # Full lifecycle integration test (E2ETest)
│   │   └── mocks/                     # MockERC20 (6-decimal USDC), MockRiskEngine
│   └── script/
│       └── Deploy.s.sol               # Deterministic protocol deployment script
└── stylus-risk-engine/         # Arbitrum Stylus Rust WASM Contract
    ├── src/
    │   ├── lib.rs                     # Fixed-point multi-factor risk calculations
    │   └── main.rs
    └── Cargo.toml                     # Stylus SDK 0.10.9 configuration
```

---

## 3. Key Invariants & Guarantees

1. **100% Full-Reserve Collateral Backing:** Every active coverage policy is backed 1:1 by locked collateral in `VaultManager`. No fractional liabilities.
2. **Solvency Preservation:** `availableCollateral = totalDeposited - lockedAmount - totalClaimsPaid >= 0` at all times.
3. **Double-Spend Immunity:** Claims require unique policy IDs, and policies transition to `Claimed` or `Expired` atomically upon settlement.
4. **Reentrancy Immunity:** All mutating and asset-moving functions enforce `ReentrancyGuard` and follow Check-Effects-Interactions (CEI).

---

## 4. Verification & Testing

### 4.1 Solidity Core (Foundry)
```bash
cd rbd-shield
forge build
forge test
```
- **39 tests passing** across unit, fuzz, and multi-contract integration suites.
- Compiler: `Solc 0.8.37`, optimizer: 200 runs.

### 4.2 Stylus Risk Engine (Rust WASM)
```bash
cd stylus-risk-engine
cargo test
cargo stylus export-abi
```
- **5 unit tests passing** testing raw metrics computation, zero-division guards, and boundary weights.

### 4.3 Simulation & Deployment Dry-Run
```bash
cd rbd-shield
forge script script/Deploy.s.sol
```

---

## 5. Hackathon Alignment

- **Arbitrum Stylus Advantage:** The Rust Stylus risk engine computes multi-factor fixed-point math and ratio calculations with 10x-100x lower gas overhead compared to the EVM.
- **Robinhood Chain Ready:** Fully compatible with Orbit EVM and Robinhood Chain (Chain ID 4663) architecture.
- **Parametric Performance Bond:** Avoids regulatory insurance classification by using verifiable on-chain bilateral performance bonds with cryptographic evidence hashing.
