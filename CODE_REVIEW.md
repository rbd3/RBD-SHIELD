# RBD Shield Code Review

**Review date:** 2026-09-22  
**Scope:** Solidity core, Stylus risk engine, deployment script, and test suites.

## Verification Performed

- `forge test -vv`: **55 passed**, 0 failed.
- `cargo test`: **9 passed**, 0 failed.

## Previous Findings — Verified Fixed

The seven findings from the previous review have been remediated in the current source:

1. `RiskEngine.update_agent_score` now requires the stored admin.
2. A pending claim prevents policy expiry, preserving its collateral for later approval.
3. Registration, term creation, and policy purchase now reject missing required dependencies.
4. Protocol fees are capped at 10,000 BPS.
5. Claim submission, active-policy checks, and expiry consistently treat `endTime` as exclusive.
6. `RiskEngine` now receives its admin through a Stylus constructor, which the deployment flow invokes atomically and cannot be called again after deployment.
7. Submitted claims have a seven-day attester-resolution window. After it elapses, anyone can reject the stale claim, allowing the expired policy to release its collateral; unresolved claims are never auto-paid.

## Leads

### Fee-on-transfer collateral can create accounting insolvency

**Location:** `rbd-shield/src/VaultManager.sol:60-70`

`deposit` credits the requested `amount` without measuring the balance actually received. A fee-on-transfer or rebasing-down collateral token can therefore overstate deposits: an early depositor may withdraw their recorded balance using collateral subsequently supplied by other agents. Canonical USDC does not ordinarily charge transfer fees, but the contracts accept any nonzero ERC-20 address and do not enforce that assumption.

**Recommendation:** Credit the balance delta observed around `safeTransferFrom`, or explicitly enforce an exact-transfer collateral asset.

### Claims-processor bootstrap gap

**Location:** `rbd-shield/src/CoverageManager.sol:192-220`, `255-267`

`purchaseCoverage` does not require `claimsProcessor` to be configured, and `expirePolicy` skips the pending-claim check when it is unset. If a policy is sold during incomplete configuration, a timely claim submitted through the already-deployed claims processor can still be voided by expiry. The provided deployment script configures the dependency promptly, so this requires an unusually long setup window.

**Recommendation:** Require a configured claims processor before a policy can be purchased, and verify the configured processor in `ClaimsProcessor.submitClaim`.

## Conclusion

The identified findings are resolved. The fee-on-transfer collateral and claims-processor bootstrap items remain documented as leads for future hardening.
