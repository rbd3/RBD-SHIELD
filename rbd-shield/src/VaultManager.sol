// SPDX-License-Identifier: MIT
// Author: rbd3
// Title: Vault Manager Contract
// Project: RBD Shield — Autonomous Risk-Underwriting Protocol

pragma solidity 0.8.37;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {RBDShieldCore} from "./core/RBDShieldCore.sol";
import {IVaultManager} from "./interfaces/IVaultManager.sol";
import {IAgentRegistry} from "./interfaces/IAgentRegistry.sol";
import {Errors} from "./libraries/Errors.sol";
import {Events} from "./libraries/Events.sol";

/**
 * @title VaultManager
 * @author rbd3
 * @notice Manages collateral custody, segregated locked-vs-available reserves, and parametric claim payouts
 */
contract VaultManager is RBDShieldCore, ReentrancyGuard, IVaultManager {
    using SafeERC20 for IERC20;

    /// @notice The collateral token accepted by the protocol (USDC with 6 decimals)
    IERC20 public immutable COLLATERAL_TOKEN;

    /// @notice Agent registry reference exposed for frontend and integration clients.
    IAgentRegistry public agentRegistry;

    /// @notice Total TVL locked or available across all vaults in the protocol
    uint256 public override totalProtocolTvl;

    /// @dev Internal mapping of agent address to Vault state
    mapping(address => Vault) private _vaults;

    /**
     * @notice Initializes the VaultManager
     * @param admin Initial protocol admin address
     * @param collateralTokenAddress Address of the collateral token (e.g. USDC)
     */
    constructor(address admin, address collateralTokenAddress) RBDShieldCore(admin) {
        if (collateralTokenAddress == address(0)) revert Errors.ZeroAddress();
        COLLATERAL_TOKEN = IERC20(collateralTokenAddress);
    }

    /**
     * @notice Sets the AgentRegistry address used by frontend and integration clients.
     * @param agentRegistryAddress AgentRegistry contract address
     */
    function setAgentRegistry(address agentRegistryAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (agentRegistryAddress == address(0)) revert Errors.ZeroAddress();
        agentRegistry = IAgentRegistry(agentRegistryAddress);
    }

    /**
     * @notice Deposits collateral into the caller's agent vault
     * @param amount Amount of collateral tokens to deposit
     */
    function deposit(uint256 amount) external override whenNotPaused nonReentrant {
        if (amount == 0) revert Errors.ZeroAmount();

        Vault storage vault = _vaults[msg.sender];
        vault.totalDeposited += amount;
        vault.exists = true;
        totalProtocolTvl += amount;

        emit Events.CollateralDeposited(msg.sender, amount, vault.totalDeposited);

        COLLATERAL_TOKEN.safeTransferFrom(msg.sender, address(this), amount);
    }

    /**
     * @notice Withdraws available (unlocked) collateral from the caller's vault
     * @param amount Amount of collateral to withdraw
     */
    function withdraw(uint256 amount) external override whenNotPaused nonReentrant {
        if (amount == 0) revert Errors.ZeroAmount();

        Vault storage vault = _vaults[msg.sender];
        if (!vault.exists) revert Errors.VaultDoesNotExist(msg.sender);

        uint256 available = _getAvailable(vault);
        if (amount > available) {
            revert Errors.InsufficientAvailableCollateral(available, amount);
        }

        vault.totalDeposited -= amount;
        totalProtocolTvl -= amount;

        emit Events.CollateralWithdrawn(msg.sender, msg.sender, amount);

        COLLATERAL_TOKEN.safeTransfer(msg.sender, amount);
    }

    /**
     * @notice Locks collateral backing newly issued coverage policies
     * @param agent Address of the underwriting agent
     * @param amount Amount of collateral to lock
     */
    function lockCollateral(address agent, uint256 amount) external override onlyRole(LOCKER_ROLE) whenNotPaused {
        if (amount == 0) revert Errors.ZeroAmount();

        Vault storage vault = _vaults[agent];
        if (!vault.exists) revert Errors.VaultDoesNotExist(agent);

        uint256 available = _getAvailable(vault);
        if (amount > available) {
            revert Errors.InsufficientAvailableCollateral(available, amount);
        }

        vault.lockedAmount += amount;
        emit Events.CollateralLocked(agent, amount, vault.lockedAmount);
    }

    /**
     * @notice Unlocks collateral when coverage expires without claims
     * @param agent Address of the underwriting agent
     * @param amount Amount of collateral to unlock
     */
    function unlockCollateral(address agent, uint256 amount) external override onlyRole(LOCKER_ROLE) {
        if (amount == 0) revert Errors.ZeroAmount();

        Vault storage vault = _vaults[agent];
        if (!vault.exists) revert Errors.VaultDoesNotExist(agent);

        if (amount > vault.lockedAmount) {
            revert Errors.InsufficientLockedCollateral(vault.lockedAmount, amount);
        }

        vault.lockedAmount -= amount;
        emit Events.CollateralUnlocked(agent, amount, vault.lockedAmount);
    }

    /**
     * @notice Dispatches an approved parametric claim payout from the agent's locked reserve
     * @param agent Address of the underwriting agent
     * @param recipient Address of the claimant receiving the payout
     * @param amount Amount of collateral to pay out
     */
    function executePayout(address agent, address recipient, uint256 amount)
        external
        override
        onlyRole(CLAIMS_EXECUTOR_ROLE)
        nonReentrant
        whenNotPaused
    {
        if (recipient == address(0)) revert Errors.ZeroAddress();
        if (amount == 0) revert Errors.ZeroAmount();

        Vault storage vault = _vaults[agent];
        if (!vault.exists) revert Errors.VaultDoesNotExist(agent);

        if (amount > vault.lockedAmount) {
            revert Errors.InsufficientLockedCollateral(vault.lockedAmount, amount);
        }

        // Deduct from locked collateral and mark as paid
        vault.lockedAmount -= amount;
        vault.totalClaimsPaid += amount;
        totalProtocolTvl -= amount;

        emit Events.PayoutExecuted(agent, recipient, amount);

        COLLATERAL_TOKEN.safeTransfer(recipient, amount);
    }

    // --- View Functions ---

    function getVault(address agent) external view override returns (Vault memory) {
        return _vaults[agent];
    }

    function getAvailableCollateral(address agent) external view override returns (uint256) {
        return _getAvailable(_vaults[agent]);
    }

    function getLockedCollateral(address agent) external view override returns (uint256) {
        return _vaults[agent].lockedAmount;
    }

    function getTotalDeposited(address agent) external view override returns (uint256) {
        return _vaults[agent].totalDeposited;
    }

    function _getAvailable(Vault storage vault) private view returns (uint256) {
        uint256 used = vault.lockedAmount + vault.totalClaimsPaid;
        if (vault.totalDeposited <= used) {
            return 0;
        }
        return vault.totalDeposited - used;
    }
}
