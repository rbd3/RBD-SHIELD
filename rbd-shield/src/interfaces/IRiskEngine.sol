// SPDX-License-Identifier: MIT
// Author: rbd3
// Title: Risk Engine Interface
// Project: RBD Shield — Autonomous Risk-Underwriting Protocol

pragma solidity 0.8.37;

/**
 * @title IRiskEngine
 * @author rbd3
 * @notice Interface matching the Rust Stylus Risk Engine WASM contract
 */
interface IRiskEngine {
    function calculateRiskScore(
        uint256 collateralRatio,
        uint256 claimsRatio,
        uint256 utilizationRatio,
        uint256 ageScore
    ) external view returns (uint256);

    function calculateFromRawMetrics(
        uint256 availableCollateral,
        uint256 lockedCollateral,
        uint256 totalDeposited,
        uint256 totalClaimsPaid,
        uint256 currentSubscribers,
        uint256 maxSubscribers,
        uint256 registrationAgeSeconds
    ) external view returns (uint256);

    function updateAgentScore(address agent, uint256 score) external;

    function getAgentScore(address agent) external view returns (uint256);

    function computeScore(uint256 collateralRatio, uint256 claimsRatio, uint256 utilizationRatio, uint256 ageScore)
        external
        pure
        returns (uint256);
}
