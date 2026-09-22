// SPDX-License-Identifier: MIT
// Author: rbd3
// Title: Protocol Constants Library
// Project: RBD Shield — Autonomous Risk-Underwriting Protocol

pragma solidity 0.8.37;

/**
 * @title Constants
 * @author rbd3
 * @notice Global numerical constants, precision scaling, and default parameters for RBD Shield
 */
library Constants {
    /// @dev Basis points denominator: 10,000 = 100%
    uint256 public constant BPS_DENOMINATOR = 10_000;

    /// @dev Fixed-point scalar for 18-decimal precision
    uint256 public constant WAD = 1e18;

    /// @dev Default minimum registration stake for agents (100 USDC in 6 decimals)
    uint256 public constant DEFAULT_MIN_STAKE = 100 * 1e6;

    /// @dev Protocol fee in basis points (e.g., 250 = 2.5%)
    uint256 public constant DEFAULT_PROTOCOL_FEE_BPS = 250;

    /// @dev Maximum duration for a single coverage term (365 days)
    uint256 public constant MAX_COVERAGE_DURATION = 365 days;

    /// @dev Minimum duration for a single coverage term (1 hour)
    uint256 public constant MIN_COVERAGE_DURATION = 1 hours;

    /// @dev Maximum time an attester has to resolve a submitted claim.
    uint256 public constant CLAIM_RESOLUTION_PERIOD = 7 days;

    /// @dev Risk score maximum cap (10,000 = lowest risk / safest)
    uint256 public constant MAX_RISK_SCORE = 10_000;
}
