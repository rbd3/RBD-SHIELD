// SPDX-License-Identifier: MIT
// Author: rbd3
// Title: Protocol Custom Errors Library
// Project: RBD Shield — Autonomous Risk-Underwriting Protocol

pragma solidity 0.8.37;

/**
 * @title Errors
 * @author rbd3
 * @notice Centralized custom errors for gas-efficient reverts across the protocol
 */
library Errors {
    // --- General Errors ---
    error ZeroAddress();
    error ZeroAmount();
    error Unauthorized();
    error AlreadyInitialized();
    error DependencyNotInitialized();

    // --- AgentRegistry Errors ---
    error AgentAlreadyRegistered(address agent);
    error AgentNotRegistered(address agent);
    error AgentNotActive(address agent);
    error AgentSuspended(address agent);
    error AgentHasActiveCoverage(address agent, uint256 activeCount);
    error InsufficientRegistrationStake(uint256 provided, uint256 required);
    error EmptyMetadataURI();

    // --- VaultManager Errors ---
    error InsufficientAvailableCollateral(uint256 available, uint256 requested);
    error InsufficientLockedCollateral(uint256 locked, uint256 requested);
    error VaultDoesNotExist(address agent);
    error TransferFailed();
    error ExceedsMaxWithdrawal();

    // --- CoverageManager Errors ---
    error InvalidDuration(uint256 duration);
    error InvalidMaxPayout(uint256 maxPayout);
    error MaxSubscribersReached(uint256 current, uint256 maxAllowed);
    error TermNotActive(uint256 termId);
    error TermDoesNotExist(uint256 termId);
    error PolicyDoesNotExist(uint256 policyId);
    error PolicyNotActive(uint256 policyId);
    error PolicyNotExpired(uint256 policyId, uint256 endTime, uint256 currentTime);
    error PolicyAlreadyExpired(uint256 policyId);
    error InsufficientPremiumPaid(uint256 paid, uint256 required);
    error ClaimPending(uint256 policyId);
    error FeeBpsExceedsDenominator(uint256 provided, uint256 maximum);

    // --- ClaimsProcessor Errors ---
    error ClaimDoesNotExist(uint256 claimId);
    error NotPolicyHolder(address caller, address policyHolder);
    error ClaimAmountExceedsMaxPayout(uint256 requested, uint256 maxPayout);
    error ClaimAlreadySubmitted(uint256 policyId);
    error InvalidClaimStatus(uint256 claimId, uint8 currentStatus);
    error EmptyEvidenceHash();

    // --- RiskEngine / Oracle Errors ---
    error StaleReport(uint256 timestamp, uint256 latestTimestamp);
    error InvalidRiskScore(uint256 score);
}
