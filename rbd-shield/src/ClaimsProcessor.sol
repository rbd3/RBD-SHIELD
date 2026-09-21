// SPDX-License-Identifier: MIT
// Author: rbd3
// Title: Claims Processor Contract
// Project: RBD Shield — Autonomous Risk-Underwriting Protocol

pragma solidity 0.8.37;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {RBDShieldCore} from "./core/RBDShieldCore.sol";
import {IClaimsProcessor} from "./interfaces/IClaimsProcessor.sol";
import {IVaultManager} from "./interfaces/IVaultManager.sol";
import {ICoverageManager} from "./interfaces/ICoverageManager.sol";
import {IAgentRegistry} from "./interfaces/IAgentRegistry.sol";
import {Errors} from "./libraries/Errors.sol";
import {Events} from "./libraries/Events.sol";

/**
 * @title ClaimsProcessor
 * @author rbd3
 * @notice Handles claim submissions, evidence verification, administrative approval, and automated vault payouts
 */
contract ClaimsProcessor is RBDShieldCore, ReentrancyGuard, IClaimsProcessor {
    /// @notice Vault manager contract reference
    IVaultManager public vaultManager;

    /// @notice Coverage manager contract reference
    ICoverageManager public coverageManager;

    /// @notice Agent registry contract reference
    IAgentRegistry public agentRegistry;

    /// @notice Next claim identifier counter
    uint256 public nextClaimId = 1;

    /// @dev Mapping from claimId to Claim struct
    mapping(uint256 => Claim) private _claims;

    /// @dev Mapping from policyId to claimId (enforces one claim per policy)
    mapping(uint256 => uint256) public policyToClaim;

    /**
     * @notice Initializes ClaimsProcessor
     * @param admin Initial protocol admin address
     * @param vaultManagerAddress VaultManager address
     * @param coverageManagerAddress CoverageManager address
     * @param agentRegistryAddress AgentRegistry address
     */
    constructor(
        address admin,
        address vaultManagerAddress,
        address coverageManagerAddress,
        address agentRegistryAddress
    ) RBDShieldCore(admin) {
        if (
            vaultManagerAddress == address(0) || coverageManagerAddress == address(0)
                || agentRegistryAddress == address(0)
        ) {
            revert Errors.ZeroAddress();
        }
        vaultManager = IVaultManager(vaultManagerAddress);
        coverageManager = ICoverageManager(coverageManagerAddress);
        agentRegistry = IAgentRegistry(agentRegistryAddress);
    }

    /**
     * @notice Submits a claim for an active policy with cryptographic evidence
     * @param policyId Policy identifier
     * @param amount Requested payout amount in collateral units
     * @param evidenceHash SHA-256 / Keccak-256 hash of off-chain execution trace or telemetry
     */
    function submitClaim(uint256 policyId, uint256 amount, bytes32 evidenceHash)
        external
        override
        whenNotPaused
        returns (uint256 claimId)
    {
        if (amount == 0) revert Errors.ZeroAmount();
        if (evidenceHash == bytes32(0)) revert Errors.EmptyEvidenceHash();
        if (policyToClaim[policyId] != 0) revert Errors.ClaimAlreadySubmitted(policyId);

        ICoverageManager.Policy memory policy = coverageManager.getPolicy(policyId);
        if (policy.policyId == 0) revert Errors.PolicyDoesNotExist(policyId);
        if (msg.sender != policy.user) revert Errors.NotPolicyHolder(msg.sender, policy.user);
        if (policy.status != ICoverageManager.PolicyStatus.Active) revert Errors.PolicyNotActive(policyId);
        if (block.timestamp > policy.endTime) revert Errors.PolicyAlreadyExpired(policyId);
        if (amount > policy.maxPayout) revert Errors.ClaimAmountExceedsMaxPayout(amount, policy.maxPayout);

        claimId = nextClaimId++;
        _claims[claimId] = Claim({
            claimId: claimId,
            policyId: policyId,
            claimant: msg.sender,
            agent: policy.agent,
            amount: amount,
            evidenceHash: evidenceHash,
            status: ClaimStatus.Submitted,
            submittedAt: block.timestamp,
            resolvedAt: 0,
            rejectionReason: ""
        });

        policyToClaim[policyId] = claimId;

        emit Events.ClaimSubmitted(claimId, policyId, msg.sender, amount, evidenceHash, block.timestamp);
    }

    /**
     * @notice Approves a submitted claim and triggers automated payout from agent vault
     * @param claimId Claim identifier
     */
    function approveClaim(uint256 claimId) external override onlyRole(ATTESTER_ROLE) nonReentrant whenNotPaused {
        Claim storage claim = _claims[claimId];
        if (claim.claimId == 0) revert Errors.ClaimDoesNotExist(claimId);
        if (claim.status != ClaimStatus.Submitted) {
            revert Errors.InvalidClaimStatus(claimId, uint8(claim.status));
        }

        claim.status = ClaimStatus.Approved;
        claim.resolvedAt = block.timestamp;

        emit Events.ClaimApproved(claimId, msg.sender, claim.amount);

        // Mark policy as claimed in CoverageManager
        coverageManager.markPolicyClaimed(claim.policyId);

        // Fetch policy details to verify if any remaining locked collateral needs unlocking
        ICoverageManager.Policy memory policy = coverageManager.getPolicy(claim.policyId);
        if (policy.maxPayout > claim.amount) {
            uint256 remainingLock = policy.maxPayout - claim.amount;
            vaultManager.unlockCollateral(claim.agent, remainingLock);
        }

        // Execute payout transfer directly from Vault to claimant
        vaultManager.executePayout(claim.agent, claim.claimant, claim.amount);

        // Record on agent's public record
        agentRegistry.recordClaimPaid(claim.agent, claim.amount);

        claim.status = ClaimStatus.Paid;
        emit Events.ClaimPaid(claimId, claim.claimant, claim.amount);
    }

    /**
     * @notice Rejects a submitted claim with an attested reason
     * @param claimId Claim identifier
     * @param reason Description of why claim was denied
     */
    function rejectClaim(uint256 claimId, string calldata reason)
        external
        override
        onlyRole(ATTESTER_ROLE)
        whenNotPaused
    {
        Claim storage claim = _claims[claimId];
        if (claim.claimId == 0) revert Errors.ClaimDoesNotExist(claimId);
        if (claim.status != ClaimStatus.Submitted) {
            revert Errors.InvalidClaimStatus(claimId, uint8(claim.status));
        }

        claim.status = ClaimStatus.Rejected;
        claim.resolvedAt = block.timestamp;
        claim.rejectionReason = reason;

        emit Events.ClaimRejected(claimId, msg.sender, reason);
    }

    // --- View Functions ---

    function getClaim(uint256 claimId) external view override returns (Claim memory) {
        return _claims[claimId];
    }

    function totalClaims() external view override returns (uint256) {
        return nextClaimId - 1;
    }
}
