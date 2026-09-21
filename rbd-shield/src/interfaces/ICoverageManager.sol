// SPDX-License-Identifier: MIT
// Author: rbd3
// Title: Coverage Manager Interface
// Project: RBD Shield — Autonomous Risk-Underwriting Protocol

pragma solidity 0.8.37;

/**
 * @title ICoverageManager
 * @author rbd3
 * @notice Interface for creating parametric coverage terms, purchasing policies, and tracking status
 */
interface ICoverageManager {
    enum PolicyStatus {
        Active,
        Expired,
        Claimed,
        Cancelled
    }

    struct CoverageTerm {
        uint256 termId;
        address agent;
        string description;
        uint256 premiumAmount;
        uint256 maxPayout;
        uint256 duration;
        uint256 maxSubscribers;
        uint256 currentSubscribers;
        bool active;
    }

    struct Policy {
        uint256 policyId;
        uint256 termId;
        address user;
        address agent;
        uint256 startTime;
        uint256 endTime;
        uint256 maxPayout;
        uint256 premiumPaid;
        PolicyStatus status;
    }

    function createTerm(
        string calldata description,
        uint256 premiumAmount,
        uint256 maxPayout,
        uint256 duration,
        uint256 maxSubscribers
    ) external returns (uint256 termId);

    function setTermStatus(uint256 termId, bool active) external;
    function purchaseCoverage(uint256 termId) external returns (uint256 policyId);
    function expirePolicy(uint256 policyId) external;
    function markPolicyClaimed(uint256 policyId) external;

    function getTerm(uint256 termId) external view returns (CoverageTerm memory);
    function getPolicy(uint256 policyId) external view returns (Policy memory);
    function isPolicyActive(uint256 policyId) external view returns (bool);
    function getAgentTerms(address agent) external view returns (uint256[] memory);
}
