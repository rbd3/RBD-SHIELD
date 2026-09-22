# RBD Shield Code Review

**Review date:** 2026-09-22  
**Scope:** Implemented Solidity core, Stylus risk engine, tests, deployment script, and alignment with `implementation_plan.md` / `IMPLEMENTATION_STATUS.md`.

## Verification Performed

- `forge test -vv`: **39 passed**, 0 failed.
- `cargo test`: **5 passed**, 0 failed.

The Solidity collateral custody and policy lifecycle are generally coherent. However, the findings below mean the protocol is not ready for public deployment.

## Findings

### 1. High — Any caller can overwrite an agent risk score

**Location:** `stylus-risk-engine/src/lib.rs:112-121`

`update_agent_score` has no access-control check. Any account can set any agent's score to any value (capped to 10,000). This contradicts the documented admin-attested scoring model and makes scores untrustworthy for a frontend, directory, or any future underwriting rule.

**Recommendation:** Store an admin/attester address or role in the Stylus contract, restrict score updates to it, emit the updater address in an event, and add authorization tests.

### 2. High — A pending valid claim can be voided once the policy expires

**Locations:**

- `rbd-shield/src/ClaimsProcessor.sol:81-86`
- `rbd-shield/src/ClaimsProcessor.sol:124-134`
- `rbd-shield/src/CoverageManager.sol:242-265`

A policyholder can submit a claim before expiry. If it remains pending until `endTime`, anyone can call `expirePolicy`, which changes the policy status to `Expired` and unlocks its collateral. A later attester approval reverts because `markPolicyClaimed` only accepts an active policy. The claimant loses their submitted claim even though it was timely.

**Recommendation:** Block expiry when a claim is pending, or add an explicit settlement rule that reserves collateral and permits approval of a claim submitted before expiry. Add tests for both approval and expiry after the deadline.

### 3. Medium — Minimum registration stake can be bypassed during deployment/configuration

**Location:** `rbd-shield/src/AgentRegistry.sol:69-74`

Registration checks the minimum stake only when `vaultManager` is already configured. A caller can register without collateral between deployment and `setVaultManager`, violating the stated registration invariant. The same optional-dependency pattern exists in coverage creation and purchase paths.

**Recommendation:** Require dependencies to be initialized before user-facing protocol operations, or make their addresses immutable / initialize all contracts atomically. Add setup-window tests.

### 4. Medium — Fee configuration can disable all premium purchases

**Locations:**

- `rbd-shield/src/CoverageManager.sol:107-109`
- `rbd-shield/src/CoverageManager.sol:193-199`

`setProtocolFeeBps` accepts values above 10,000. A fee above 100% makes `premiumAmount - fee` underflow and reverts every purchase with a nonzero premium.

**Recommendation:** Enforce `newFeeBps <= Constants.BPS_DENOMINATOR`, preferably with a protocol-specific lower maximum. Add boundary tests.

### 5. Low — Claim eligibility and expiry disagree at the exact end-time

**Locations:**

- `rbd-shield/src/ClaimsProcessor.sol:85`
- `rbd-shield/src/CoverageManager.sol:246-248`
- `rbd-shield/src/CoverageManager.sol:299-301`

At exactly `endTime`, `isPolicyActive` is false and `expirePolicy` succeeds, but `submitClaim` still permits a claim because it only rejects timestamps greater than `endTime`. This creates an unnecessary ordering race.

**Recommendation:** Define one inclusive/exclusive deadline rule and use it consistently across all policy lifecycle functions.

## Plan and Status Reconciliation

The status document overstates completion in several areas:

- **Phase 6 is not implemented:** no `PerformanceReporter` role, report storage, report submission function, stale-report validation, or tests exist.
- **Risk scoring is not integrated into the Solidity protocol:** no Solidity contract reads `IRiskEngine` or enforces a score/capacity decision.
- **The integration test uses `MockRiskEngine`, not the Stylus deployment:** it validates math through a mock but not the declared Solidity-to-Stylus integration boundary.
- **No Foundry invariant suite exists:** the repository contains a deposit/withdraw fuzz test, not stateful invariant-handler tests.
- **Frontend remains pending**, as the status file itself notes.

## Recommended Fix Order

1. Add authorization to Stylus score updates.
2. Preserve timely pending claims through expiry and test the resolution paths.
3. Enforce initialized dependencies before public operations.
4. Bound protocol fees.
5. Implement the performance-reporting and Solidity-to-Stylus integration promised by the plan, with real integration tests.
