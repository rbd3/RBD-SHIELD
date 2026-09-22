// SPDX-License-Identifier: MIT
// Author: rbd3
// Title: Mock Risk Engine Contract
// Project: RBD Shield — Autonomous Risk-Underwriting Protocol

pragma solidity 0.8.37;

import {IRiskEngine} from "../../src/interfaces/IRiskEngine.sol";

/**
 * @title MockRiskEngine
 * @author rbd3
 * @notice Solidity implementation of the Stylus Risk Engine interface for Foundry testing
 */
contract MockRiskEngine is IRiskEngine {
    uint256 public constant BPS_DENOMINATOR = 10_000;
    uint256 public constant WEIGHT_COLLATERAL = 4_000;
    uint256 public constant WEIGHT_CLAIMS = 2_500;
    uint256 public constant WEIGHT_UTILIZATION = 2_000;
    uint256 public constant WEIGHT_AGE = 1_500;
    uint256 public constant SECONDS_PER_YEAR = 31_536_000;

    address public admin;
    mapping(address => uint256) public agentScores;

    constructor(address initialAdmin) {
        if (initialAdmin == address(0)) revert ZeroAddress();
        admin = initialAdmin;
        emit AdminTransferred(address(0), initialAdmin);
    }

    function transferAdmin(address newAdmin) external override {
        if (msg.sender != admin) revert Unauthorized();
        if (newAdmin == address(0)) revert ZeroAddress();
        address oldAdmin = admin;
        admin = newAdmin;
        emit AdminTransferred(oldAdmin, newAdmin);
    }

    function getAdmin() external view override returns (address) {
        return admin;
    }

    function calculateRiskScore(
        uint256 collateralRatio,
        uint256 claimsRatio,
        uint256 utilizationRatio,
        uint256 ageScore
    ) external pure override returns (uint256) {
        return computeScore(collateralRatio, claimsRatio, utilizationRatio, ageScore);
    }

    function calculateFromRawMetrics(
        uint256 availableCollateral,
        uint256 lockedCollateral,
        uint256 totalDeposited,
        uint256 totalClaimsPaid,
        uint256 currentSubscribers,
        uint256 maxSubscribers,
        uint256 registrationAgeSeconds
    ) external pure override returns (uint256) {
        uint256 collateralBps = lockedCollateral == 0
            ? BPS_DENOMINATOR
            : (availableCollateral * BPS_DENOMINATOR) / lockedCollateral;
        if (collateralBps > BPS_DENOMINATOR) collateralBps = BPS_DENOMINATOR;

        uint256 claimsBps = 0;
        if (totalDeposited > 0 && totalClaimsPaid < totalDeposited) {
            uint256 lossRatio = (totalClaimsPaid * BPS_DENOMINATOR) / totalDeposited;
            if (lossRatio < BPS_DENOMINATOR) {
                claimsBps = BPS_DENOMINATOR - lossRatio;
            }
        }

        uint256 utilBps = 0;
        if (maxSubscribers > 0 && currentSubscribers < maxSubscribers) {
            uint256 used = (currentSubscribers * BPS_DENOMINATOR) / maxSubscribers;
            if (used < BPS_DENOMINATOR) {
                utilBps = BPS_DENOMINATOR - used;
            }
        }

        uint256 ageBps = (registrationAgeSeconds * BPS_DENOMINATOR) / SECONDS_PER_YEAR;
        if (ageBps > BPS_DENOMINATOR) ageBps = BPS_DENOMINATOR;

        return computeScore(collateralBps, claimsBps, utilBps, ageBps);
    }

    function updateAgentScore(address agent, uint256 score) external override {
        if (msg.sender != admin) revert Unauthorized();
        uint256 capped = score > BPS_DENOMINATOR ? BPS_DENOMINATOR : score;
        agentScores[agent] = capped;
        emit RiskScoreUpdated(agent, capped, msg.sender, block.timestamp);
    }

    function getAgentScore(address agent) external view override returns (uint256) {
        return agentScores[agent];
    }

    function computeScore(uint256 collateralRatio, uint256 claimsRatio, uint256 utilizationRatio, uint256 ageScore)
        public
        pure
        override
        returns (uint256)
    {
        uint256 c = collateralRatio > BPS_DENOMINATOR ? BPS_DENOMINATOR : collateralRatio;
        uint256 cl = claimsRatio > BPS_DENOMINATOR ? BPS_DENOMINATOR : claimsRatio;
        uint256 u = utilizationRatio > BPS_DENOMINATOR ? BPS_DENOMINATOR : utilizationRatio;
        uint256 a = ageScore > BPS_DENOMINATOR ? BPS_DENOMINATOR : ageScore;

        uint256 weightedSum =
            (c * WEIGHT_COLLATERAL) + (cl * WEIGHT_CLAIMS) + (u * WEIGHT_UTILIZATION) + (a * WEIGHT_AGE);

        return weightedSum / BPS_DENOMINATOR;
    }
}
