// SPDX-License-Identifier: MIT
// Author: rbd3
// Title: RBD Shield Core Access Control & Emergency Pause
// Project: RBD Shield — Autonomous Risk-Underwriting Protocol

pragma solidity 0.8.37;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {Errors} from "../libraries/Errors.sol";

/**
 * @title RBDShieldCore
 * @author rbd3
 * @notice Shared base contract providing role-based permissions, emergency circuit breakers, and core invariants
 */
abstract contract RBDShieldCore is AccessControl, Pausable {
    /// @dev Role allowed to manage protocol risk parameters and score updates
    bytes32 public constant RISK_ADMIN_ROLE = keccak256("RISK_ADMIN_ROLE");

    /// @dev Role allowed to submit performance attestations and verify claims
    bytes32 public constant ATTESTER_ROLE = keccak256("ATTESTER_ROLE");

    /// @dev Role allowed to lock and unlock vault collateral (CoverageManager)
    bytes32 public constant LOCKER_ROLE = keccak256("LOCKER_ROLE");

    /// @dev Role allowed to execute payouts from the vault (ClaimsProcessor)
    bytes32 public constant CLAIMS_EXECUTOR_ROLE = keccak256("CLAIMS_EXECUTOR_ROLE");

    /// @dev Role allowed to trigger emergency pause and unpause
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    /**
     * @notice Initializes the access control hierarchy setting initial admin
     * @param admin The initial super-administrator
     */
    constructor(address admin) {
        if (admin == address(0)) revert Errors.ZeroAddress();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(RISK_ADMIN_ROLE, admin);
        _grantRole(ATTESTER_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
    }

    /**
     * @notice Triggers emergency protocol pause
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @notice Unpauses protocol operations
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }
}
