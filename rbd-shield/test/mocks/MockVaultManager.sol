// SPDX-License-Identifier: MIT
// Author: rbd3
// Title: Mock Vault Manager for Testing
// Project: RBD Shield — Autonomous Risk-Underwriting Protocol

pragma solidity 0.8.37;

import {IVaultManager} from "../../src/interfaces/IVaultManager.sol";

/**
 * @title MockVaultManager
 * @notice Minimal test double for IVaultManager. Allows per-agent balance configuration.
 */
contract MockVaultManager is IVaultManager {
    mapping(address => uint256) public availableCollateral;
    mapping(address => uint256) public lockedCollateral;

    /// @notice Set the simulated available collateral for an agent
    function setAvailableCollateral(address agent, uint256 amount) external {
        availableCollateral[agent] = amount;
    }

    function deposit(uint256) external pure override {}

    function withdraw(uint256) external pure override {}

    function lockCollateral(address agent, uint256 amount) external override {
        lockedCollateral[agent] += amount;
    }

    function unlockCollateral(address agent, uint256 amount) external override {
        if (lockedCollateral[agent] >= amount) {
            lockedCollateral[agent] -= amount;
        }
    }

    function executePayout(address agent, address, uint256 amount) external override {
        if (lockedCollateral[agent] >= amount) {
            lockedCollateral[agent] -= amount;
        }
    }

    function getAvailableCollateral(address agent) external view override returns (uint256) {
        return availableCollateral[agent];
    }

    function getLockedCollateral(address agent) external view override returns (uint256) {
        return lockedCollateral[agent];
    }

    function getTotalDeposited(address agent) external view override returns (uint256) {
        return availableCollateral[agent] + lockedCollateral[agent];
    }

    function totalProtocolTvl() external pure override returns (uint256) {
        return 0;
    }

    function getVault(address agent) external view override returns (Vault memory) {
        return Vault({
            totalDeposited: availableCollateral[agent] + lockedCollateral[agent],
            lockedAmount: lockedCollateral[agent],
            totalClaimsPaid: 0,
            exists: availableCollateral[agent] + lockedCollateral[agent] > 0
        });
    }
}
