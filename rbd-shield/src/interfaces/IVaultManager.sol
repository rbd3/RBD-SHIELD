// SPDX-License-Identifier: MIT
// Author: rbd3
// Title: Vault Manager Interface
// Project: RBD Shield — Autonomous Risk-Underwriting Protocol

pragma solidity 0.8.37;

/**
 * @title IVaultManager
 * @author rbd3
 * @notice Interface for vault collateral custody, locked reserves, and claims payout execution
 */
interface IVaultManager {
    struct Vault {
        uint256 totalDeposited;
        uint256 lockedAmount;
        uint256 totalClaimsPaid;
        bool exists;
    }

    function deposit(uint256 amount) external;
    function withdraw(uint256 amount) external;
    function lockCollateral(address agent, uint256 amount) external;
    function unlockCollateral(address agent, uint256 amount) external;
    function executePayout(address agent, address recipient, uint256 amount) external;

    function getVault(address agent) external view returns (Vault memory);
    function getAvailableCollateral(address agent) external view returns (uint256);
    function getLockedCollateral(address agent) external view returns (uint256);
    function getTotalDeposited(address agent) external view returns (uint256);
    function totalProtocolTvl() external view returns (uint256);
}
