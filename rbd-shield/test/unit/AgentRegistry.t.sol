// SPDX-License-Identifier: MIT
// Author: rbd3
// Title: Agent Registry Unit Tests
// Project: RBD Shield — Autonomous Risk-Underwriting Protocol

pragma solidity 0.8.37;

import {Test} from "forge-std/Test.sol";
import {AgentRegistry} from "../../src/AgentRegistry.sol";
import {IAgentRegistry} from "../../src/interfaces/IAgentRegistry.sol";
import {Errors} from "../../src/libraries/Errors.sol";
import {MockVaultManager} from "../mocks/MockVaultManager.sol";

contract AgentRegistryTest is Test {
    AgentRegistry public registry;

    address public admin = address(0xAD);
    address public riskAdmin = address(0xBA);
    address public agent1 = address(0xA1);
    address public agent2 = address(0xA2);
    address public user1 = address(0xB1);

    string public constant METADATA_URI = "ipfs://QmAgentV1Specification";
    string public constant NEW_METADATA_URI = "ipfs://QmAgentV2SpecificationUpdated";

    function setUp() public {
        registry = new AgentRegistry(admin, 0);

        vm.startPrank(admin);
        registry.grantRole(registry.RISK_ADMIN_ROLE(), riskAdmin);
        vm.stopPrank();
    }

    function test_RegisterAgent_Success() public {
        vm.prank(agent1);
        registry.registerAgent(METADATA_URI);

        IAgentRegistry.Agent memory agentData = registry.getAgent(agent1);
        assertEq(agentData.agentAddress, agent1);
        assertEq(agentData.metadataURI, METADATA_URI);
        assertEq(uint8(agentData.status), uint8(IAgentRegistry.AgentStatus.Active));
        assertEq(agentData.totalCoverageIssued, 0);
        assertEq(agentData.totalClaimsPaid, 0);
        assertEq(agentData.activePoliciesCount, 0);
        assertTrue(registry.isActiveAgent(agent1));
        assertEq(registry.totalAgents(), 1);
    }

    function test_RegisterAgent_EmptyURI_Reverts() public {
        vm.prank(agent1);
        vm.expectRevert(Errors.EmptyMetadataURI.selector);
        registry.registerAgent("");
    }

    function test_RegisterAgent_AlreadyRegistered_Reverts() public {
        vm.prank(agent1);
        registry.registerAgent(METADATA_URI);

        vm.prank(agent1);
        vm.expectRevert(abi.encodeWithSelector(Errors.AgentAlreadyRegistered.selector, agent1));
        registry.registerAgent(METADATA_URI);
    }

    function test_UpdateMetadata_Success() public {
        vm.prank(agent1);
        registry.registerAgent(METADATA_URI);

        vm.prank(agent1);
        registry.updateMetadata(NEW_METADATA_URI);

        IAgentRegistry.Agent memory agentData = registry.getAgent(agent1);
        assertEq(agentData.metadataURI, NEW_METADATA_URI);
    }

    function test_UpdateMetadata_EmptyURI_Reverts() public {
        vm.prank(agent1);
        registry.registerAgent(METADATA_URI);

        vm.prank(agent1);
        vm.expectRevert(Errors.EmptyMetadataURI.selector);
        registry.updateMetadata("");
    }

    function test_UpdateMetadata_NotActive_Reverts() public {
        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSelector(Errors.AgentNotActive.selector, user1));
        registry.updateMetadata(NEW_METADATA_URI);
    }

    function test_SuspendAgent_ByAdmin_Success() public {
        vm.prank(agent1);
        registry.registerAgent(METADATA_URI);

        vm.prank(riskAdmin);
        registry.suspendAgent(agent1, "Exceeded drawdown threshold");

        assertFalse(registry.isActiveAgent(agent1));
        assertEq(uint8(registry.getAgentStatus(agent1)), uint8(IAgentRegistry.AgentStatus.Suspended));
    }

    function test_SuspendAgent_ByNonAdmin_Reverts() public {
        vm.prank(agent1);
        registry.registerAgent(METADATA_URI);

        vm.prank(user1);
        vm.expectRevert();
        registry.suspendAgent(agent1, "Unauthorized");
    }

    function test_ReactivateAgent_Success() public {
        vm.prank(agent1);
        registry.registerAgent(METADATA_URI);

        vm.prank(riskAdmin);
        registry.suspendAgent(agent1, "Temporary maintenance");

        vm.prank(riskAdmin);
        registry.reactivateAgent(agent1);

        assertTrue(registry.isActiveAgent(agent1));
        assertEq(uint8(registry.getAgentStatus(agent1)), uint8(IAgentRegistry.AgentStatus.Active));
    }

    function test_DeregisterAgent_Success() public {
        vm.prank(agent1);
        registry.registerAgent(METADATA_URI);

        vm.prank(agent1);
        registry.deregisterAgent();

        assertFalse(registry.isActiveAgent(agent1));
        assertEq(uint8(registry.getAgentStatus(agent1)), uint8(IAgentRegistry.AgentStatus.Deregistered));
    }

    function test_DeregisterAgent_WithActiveCoverage_Reverts() public {
        vm.prank(agent1);
        registry.registerAgent(METADATA_URI);

        address locker = address(0xCC);
        bytes32 lockerRole = registry.LOCKER_ROLE();
        vm.prank(admin);
        registry.grantRole(lockerRole, locker);

        vm.prank(locker);
        registry.incrementActivePolicies(agent1);

        vm.prank(agent1);
        vm.expectRevert(abi.encodeWithSelector(Errors.AgentHasActiveCoverage.selector, agent1, 1));
        registry.deregisterAgent();
    }

    function test_Pause_PreventsRegistration() public {
        vm.prank(admin);
        registry.pause();

        vm.prank(agent1);
        vm.expectRevert();
        registry.registerAgent(METADATA_URI);
    }

    function testFuzz_RegisterAgent(string calldata metadataURI) public {
        vm.assume(bytes(metadataURI).length > 0);
        address randomAgent = makeAddr(metadataURI);

        vm.prank(randomAgent);
        registry.registerAgent(metadataURI);

        assertTrue(registry.isActiveAgent(randomAgent));
        assertEq(registry.getAgent(randomAgent).metadataURI, metadataURI);
    }

    // -----------------------------------------------------------------------
    // Finding 3 — Registration stake bypass during setup window
    // -----------------------------------------------------------------------

    /// @notice When minRegistrationStake > 0 but vaultManager has not been set,
    ///         registerAgent must revert with DependencyNotInitialized instead of
    ///         silently skipping the collateral check.
    function test_RegisterAgent_VaultManagerUnset_WithMinStake_Reverts() public {
        // Deploy a registry that requires a non-zero stake
        AgentRegistry strictRegistry = new AgentRegistry(admin, 100e6);

        vm.prank(agent1);
        vm.expectRevert(Errors.DependencyNotInitialized.selector);
        strictRegistry.registerAgent(METADATA_URI);
    }

    /// @notice Once vaultManager is wired and the agent holds sufficient collateral,
    ///         registration must succeed.
    function test_RegisterAgent_WithVaultManager_SufficientStake_Success() public {
        uint256 minStake = 100e6;
        AgentRegistry strictRegistry = new AgentRegistry(admin, minStake);

        MockVaultManager vault = new MockVaultManager();
        vault.setAvailableCollateral(agent1, minStake);

        vm.prank(admin);
        strictRegistry.setVaultManager(address(vault));

        vm.prank(agent1);
        strictRegistry.registerAgent(METADATA_URI);

        assertTrue(strictRegistry.isActiveAgent(agent1));
    }

    /// @notice When vaultManager is set but the agent's collateral falls below the minimum,
    ///         registration reverts with InsufficientRegistrationStake.
    function test_RegisterAgent_WithVaultManager_InsufficientStake_Reverts() public {
        uint256 minStake = 100e6;
        AgentRegistry strictRegistry = new AgentRegistry(admin, minStake);

        MockVaultManager vault = new MockVaultManager();
        vault.setAvailableCollateral(agent1, minStake - 1);

        vm.prank(admin);
        strictRegistry.setVaultManager(address(vault));

        vm.prank(agent1);
        vm.expectRevert(
            abi.encodeWithSelector(Errors.InsufficientRegistrationStake.selector, minStake - 1, minStake)
        );
        strictRegistry.registerAgent(METADATA_URI);
    }
}
