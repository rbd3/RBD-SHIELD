// SPDX-License-Identifier: MIT
// Author: rbd3
// Title: Agent Registry Interface
// Project: RBD Shield — Autonomous Risk-Underwriting Protocol

pragma solidity 0.8.37;

/**
 * @title IAgentRegistry
 * @author rbd3
 * @notice Interface for the agent registry managing autonomous agent identities, metadata, and status
 */
interface IAgentRegistry {
    enum AgentStatus {
        Unregistered,
        Active,
        Suspended,
        Deregistered
    }

    struct Agent {
        address agentAddress;
        string metadataURI;
        AgentStatus status;
        uint256 registeredAt;
        uint256 totalCoverageIssued;
        uint256 totalClaimsPaid;
        uint256 activePoliciesCount;
    }

    function registerAgent(string calldata metadataURI) external;
    function updateMetadata(string calldata newMetadataURI) external;
    function suspendAgent(address agent, string calldata reason) external;
    function reactivateAgent(address agent) external;
    function deregisterAgent() external;
    
    function incrementActivePolicies(address agent) external;
    function decrementActivePolicies(address agent) external;
    function recordClaimPaid(address agent, uint256 claimAmount) external;
    function recordCoverageIssued(address agent, uint256 coverageAmount) external;

    function getAgent(address agent) external view returns (Agent memory);
    function isActiveAgent(address agent) external view returns (bool);
    function getAgentStatus(address agent) external view returns (AgentStatus);
    function totalAgents() external view returns (uint256);
}
