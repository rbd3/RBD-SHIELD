// SPDX-License-Identifier: MIT
// Author: rbd3
// Title: Agent Registry Contract
// Project: RBD Shield — Autonomous Risk-Underwriting Protocol

pragma solidity 0.8.37;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {RBDShieldCore} from "./core/RBDShieldCore.sol";
import {IAgentRegistry} from "./interfaces/IAgentRegistry.sol";
import {IVaultManager} from "./interfaces/IVaultManager.sol";
import {Errors} from "./libraries/Errors.sol";
import {Events} from "./libraries/Events.sol";

/**
 * @title AgentRegistry
 * @author rbd3
 * @notice Protocol registry for autonomous AI agents, managing lifecycle, metadata, and underwriting status
 */
contract AgentRegistry is RBDShieldCore, ReentrancyGuard, IAgentRegistry {
    /// @notice Minimum collateral requirement in USDC (6 decimals) required to register
    uint256 public minRegistrationStake;

    /// @notice Vault manager contract reference for collateral verification
    IVaultManager public vaultManager;

    /// @dev Internal mapping storing agent information
    mapping(address => Agent) private _agents;

    /// @dev Array of all registered agent addresses
    address[] private _registeredAgents;

    /**
     * @notice Initializes the AgentRegistry
     * @param admin Initial protocol admin address
     * @param minStake Minimum collateral stake required for registration
     */
    constructor(address admin, uint256 minStake) RBDShieldCore(admin) {
        minRegistrationStake = minStake;
    }

    /**
     * @notice Sets the VaultManager address for collateral verification
     * @param vaultManagerAddress The VaultManager contract
     */
    function setVaultManager(address vaultManagerAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (vaultManagerAddress == address(0)) revert Errors.ZeroAddress();
        vaultManager = IVaultManager(vaultManagerAddress);
    }

    /**
     * @notice Updates the minimum registration collateral requirement
     * @param newMinStake New minimum stake amount
     */
    function setMinRegistrationStake(uint256 newMinStake) external onlyRole(RISK_ADMIN_ROLE) {
        minRegistrationStake = newMinStake;
    }

    /**
     * @notice Registers the calling address as an autonomous AI agent
     * @param metadataURI URI pointing to agent documentation, model specs, or endpoints
     */
    function registerAgent(string calldata metadataURI) external whenNotPaused nonReentrant {
        if (bytes(metadataURI).length == 0) revert Errors.EmptyMetadataURI();
        if (_agents[msg.sender].status != AgentStatus.Unregistered) {
            revert Errors.AgentAlreadyRegistered(msg.sender);
        }

        if (minRegistrationStake > 0) {
            if (address(vaultManager) == address(0)) revert Errors.DependencyNotInitialized();
            uint256 available = vaultManager.getAvailableCollateral(msg.sender);
            if (available < minRegistrationStake) {
                revert Errors.InsufficientRegistrationStake(available, minRegistrationStake);
            }
        }

        _agents[msg.sender] = Agent({
            agentAddress: msg.sender,
            metadataURI: metadataURI,
            status: AgentStatus.Active,
            registeredAt: block.timestamp,
            totalCoverageIssued: 0,
            totalClaimsPaid: 0,
            activePoliciesCount: 0
        });

        _registeredAgents.push(msg.sender);

        emit Events.AgentRegistered(msg.sender, metadataURI, block.timestamp);
    }

    /**
     * @notice Updates the metadata URI for a registered agent
     * @param newMetadataURI New metadata URI
     */
    function updateMetadata(string calldata newMetadataURI) external whenNotPaused {
        if (bytes(newMetadataURI).length == 0) revert Errors.EmptyMetadataURI();
        if (_agents[msg.sender].status != AgentStatus.Active) {
            revert Errors.AgentNotActive(msg.sender);
        }

        _agents[msg.sender].metadataURI = newMetadataURI;
        emit Events.AgentMetadataUpdated(msg.sender, newMetadataURI);
    }

    /**
     * @notice Suspends an agent from underwriting new policies
     * @param agent Address of the agent
     * @param reason Explanation for suspension
     */
    function suspendAgent(address agent, string calldata reason) external onlyRole(RISK_ADMIN_ROLE) {
        if (_agents[agent].status != AgentStatus.Active) {
            revert Errors.AgentNotActive(agent);
        }

        _agents[agent].status = AgentStatus.Suspended;
        emit Events.AgentSuspended(agent, msg.sender, reason);
    }

    /**
     * @notice Reactivates a suspended agent
     * @param agent Address of the agent
     */
    function reactivateAgent(address agent) external onlyRole(RISK_ADMIN_ROLE) {
        if (_agents[agent].status != AgentStatus.Suspended) {
            revert Errors.AgentSuspended(agent);
        }

        _agents[agent].status = AgentStatus.Active;
        emit Events.AgentReactivated(agent, msg.sender);
    }

    /**
     * @notice Deregisters the calling agent if they have no active coverage obligations
     */
    function deregisterAgent() external whenNotPaused nonReentrant {
        Agent storage agentData = _agents[msg.sender];
        if (agentData.status == AgentStatus.Unregistered || agentData.status == AgentStatus.Deregistered) {
            revert Errors.AgentNotRegistered(msg.sender);
        }

        if (agentData.activePoliciesCount > 0) {
            revert Errors.AgentHasActiveCoverage(msg.sender, agentData.activePoliciesCount);
        }

        agentData.status = AgentStatus.Deregistered;
        emit Events.AgentDeregistered(msg.sender, block.timestamp);
    }

    /**
     * @notice Increments the active policies count for an agent
     * @param agent Agent address
     */
    function incrementActivePolicies(address agent) external onlyRole(LOCKER_ROLE) {
        if (_agents[agent].status != AgentStatus.Active) revert Errors.AgentNotActive(agent);
        _agents[agent].activePoliciesCount += 1;
    }

    /**
     * @notice Decrements the active policies count for an agent
     * @param agent Agent address
     */
    function decrementActivePolicies(address agent) external onlyRole(LOCKER_ROLE) {
        if (_agents[agent].activePoliciesCount > 0) {
            _agents[agent].activePoliciesCount -= 1;
        }
    }

    /**
     * @notice Records a paid claim against the agent's historical record
     * @param agent Agent address
     * @param claimAmount Amount paid out in USDC
     */
    function recordClaimPaid(address agent, uint256 claimAmount) external onlyRole(CLAIMS_EXECUTOR_ROLE) {
        _agents[agent].totalClaimsPaid += claimAmount;
    }

    /**
     * @notice Records new coverage issued by the agent
     * @param agent Agent address
     * @param coverageAmount Amount of coverage underwritten in USDC
     */
    function recordCoverageIssued(address agent, uint256 coverageAmount) external onlyRole(LOCKER_ROLE) {
        _agents[agent].totalCoverageIssued += coverageAmount;
    }

    // --- View Functions ---

    function getAgent(address agent) external view returns (Agent memory) {
        return _agents[agent];
    }

    function isActiveAgent(address agent) external view returns (bool) {
        return _agents[agent].status == AgentStatus.Active;
    }

    function getAgentStatus(address agent) external view returns (AgentStatus) {
        return _agents[agent].status;
    }

    function totalAgents() external view returns (uint256) {
        return _registeredAgents.length;
    }

    function getRegisteredAgents() external view returns (address[] memory) {
        return _registeredAgents;
    }
}
