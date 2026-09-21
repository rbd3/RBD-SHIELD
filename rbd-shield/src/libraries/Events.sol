// SPDX-License-Identifier: MIT
// Author: rbd3
// Title: Protocol Events Library
// Project: RBD Shield — Autonomous Risk-Underwriting Protocol

pragma solidity 0.8.37;

/**
 * @title Events
 * @author rbd3
 * @notice Centralized event declarations for indexed off-chain tracking and subgraph indexing
 */
library Events {
    // --- AgentRegistry Events ---
    event AgentRegistered(address indexed agent, string metadataURI, uint256 registeredAt);
    event AgentMetadataUpdated(address indexed agent, string newMetadataURI);
    event AgentSuspended(address indexed agent, address indexed suspendedBy, string reason);
    event AgentReactivated(address indexed agent, address indexed reactivatedBy);
    event AgentDeregistered(address indexed agent, uint256 deregisteredAt);

    // --- VaultManager Events ---
    event CollateralDeposited(address indexed agent, uint256 amount, uint256 newTotalDeposited);
    event CollateralWithdrawn(address indexed agent, address indexed recipient, uint256 amount);
    event CollateralLocked(address indexed agent, uint256 amount, uint256 newTotalLocked);
    event CollateralUnlocked(address indexed agent, uint256 amount, uint256 newTotalLocked);
    event PayoutExecuted(address indexed agent, address indexed recipient, uint256 amount);

    // --- CoverageManager Events ---
    event TermCreated(
        uint256 indexed termId,
        address indexed agent,
        uint256 maxPayout,
        uint256 premiumAmount,
        uint256 duration,
        uint256 maxSubscribers
    );
    event TermStatusUpdated(uint256 indexed termId, bool active);
    event PolicyPurchased(
        uint256 indexed policyId,
        uint256 indexed termId,
        address indexed subscriber,
        address agent,
        uint256 startTime,
        uint256 endTime,
        uint256 coverageAmount,
        uint256 premiumPaid
    );
    event PolicyExpired(uint256 indexed policyId, uint256 indexed termId, address indexed agent);
    event PolicyCancelled(uint256 indexed policyId);

    // --- ClaimsProcessor Events ---
    event ClaimSubmitted(
        uint256 indexed claimId,
        uint256 indexed policyId,
        address indexed claimant,
        uint256 amount,
        bytes32 evidenceHash,
        uint256 timestamp
    );
    event ClaimApproved(uint256 indexed claimId, address indexed approvedBy, uint256 amountApproved);
    event ClaimRejected(uint256 indexed claimId, address indexed rejectedBy, string reason);
    event ClaimPaid(uint256 indexed claimId, address indexed recipient, uint256 payoutAmount);

    // --- Performance / Risk Events ---
    event PerformanceReportSubmitted(address indexed agent, int256 performanceScore, uint256 timestamp, address indexed reporter);
    event RiskScoreUpdated(address indexed agent, uint256 newScore, uint256 timestamp);
}
