// SPDX-License-Identifier: MIT
// Author: rbd3
// Title: Claims Processor Interface
// Project: RBD Shield — Autonomous Risk-Underwriting Protocol

pragma solidity 0.8.37;

/**
 * @title IClaimsProcessor
 * @author rbd3
 * @notice Interface for submitting, verifying, and paying parametric performance bond claims
 */
interface IClaimsProcessor {
    enum ClaimStatus {
        None,
        Submitted,
        Approved,
        Rejected,
        Paid
    }

    struct Claim {
        uint256 claimId;
        uint256 policyId;
        address claimant;
        address agent;
        uint256 amount;
        bytes32 evidenceHash;
        ClaimStatus status;
        uint256 submittedAt;
        uint256 resolvedAt;
        string rejectionReason;
    }

    function submitClaim(uint256 policyId, uint256 amount, bytes32 evidenceHash) external returns (uint256 claimId);

    function approveClaim(uint256 claimId) external;
    function rejectClaim(uint256 claimId, string calldata reason) external;

    function getClaim(uint256 claimId) external view returns (Claim memory);
    function totalClaims() external view returns (uint256);
}
