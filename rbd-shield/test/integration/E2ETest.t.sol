// SPDX-License-Identifier: MIT
// Author: rbd3
// Title: End-to-End Protocol Lifecycle Integration Test
// Project: RBD Shield — Autonomous Risk-Underwriting Protocol

pragma solidity 0.8.37;

import {Test} from "forge-std/Test.sol";
import {AgentRegistry} from "../../src/AgentRegistry.sol";
import {VaultManager} from "../../src/VaultManager.sol";
import {CoverageManager} from "../../src/CoverageManager.sol";
import {ClaimsProcessor} from "../../src/ClaimsProcessor.sol";
import {MockERC20} from "../mocks/MockERC20.sol";
import {MockRiskEngine} from "../mocks/MockRiskEngine.sol";
import {IAgentRegistry} from "../../src/interfaces/IAgentRegistry.sol";
import {ICoverageManager} from "../../src/interfaces/ICoverageManager.sol";
import {IClaimsProcessor} from "../../src/interfaces/IClaimsProcessor.sol";

contract E2ETest is Test {
    AgentRegistry public registry;
    VaultManager public vault;
    CoverageManager public coverageManager;
    ClaimsProcessor public claimsProcessor;
    MockRiskEngine public riskEngine;
    MockERC20 public usdc;

    address public admin = address(0xAD);
    address public attester = address(0xAE);
    address public treasury = address(0x77);
    address public agent1 = address(0xA1);
    address public user1 = address(0xB1);

    uint256 public constant INITIAL_USDC = 500_000 * 1e6; // 500,000 USDC
    uint256 public constant AGENT_DEPOSIT = 100_000 * 1e6; // 100,000 USDC
    uint256 public constant MAX_PAYOUT = 20_000 * 1e6; // 20,000 USDC
    uint256 public constant PREMIUM = 500 * 1e6; // 500 USDC
    uint256 public constant DURATION = 30 days;

    function setUp() public {
        // 1. Deploy Core Tokens and Contracts
        usdc = new MockERC20("USD Coin", "USDC", 6);
        vault = new VaultManager(admin, address(usdc));
        registry = new AgentRegistry(admin, 100 * 1e6); // 100 USDC min stake
        riskEngine = new MockRiskEngine();

        coverageManager = new CoverageManager(admin, address(usdc), treasury, address(vault), address(registry));

        claimsProcessor = new ClaimsProcessor(admin, address(vault), address(coverageManager), address(registry));

        // 2. Wire Permissions & Roles
        bytes32 lockerRole = vault.LOCKER_ROLE();
        bytes32 claimsRole = vault.CLAIMS_EXECUTOR_ROLE();
        bytes32 attesterRole = claimsProcessor.ATTESTER_ROLE();

        vm.startPrank(admin);
        vault.setAgentRegistry(address(registry));
        registry.setVaultManager(address(vault));

        vault.grantRole(lockerRole, address(coverageManager));
        vault.grantRole(lockerRole, address(claimsProcessor));
        vault.grantRole(claimsRole, address(claimsProcessor));

        registry.grantRole(lockerRole, address(coverageManager));
        registry.grantRole(claimsRole, address(claimsProcessor));

        coverageManager.grantRole(claimsRole, address(claimsProcessor));
        claimsProcessor.grantRole(attesterRole, attester);
        vm.stopPrank();

        // 3. Fund Accounts
        usdc.mint(agent1, INITIAL_USDC);
        usdc.mint(user1, INITIAL_USDC);

        vm.prank(agent1);
        usdc.approve(address(vault), type(uint256).max);

        vm.prank(user1);
        usdc.approve(address(coverageManager), type(uint256).max);
    }

    function test_FullProtocolE2ELifecycle() public {
        // --- STEP 1: Agent Deposits Collateral ---
        vm.prank(agent1);
        vault.deposit(AGENT_DEPOSIT);

        assertEq(vault.getTotalDeposited(agent1), AGENT_DEPOSIT);
        assertEq(vault.getAvailableCollateral(agent1), AGENT_DEPOSIT);
        assertEq(vault.totalProtocolTvl(), AGENT_DEPOSIT);

        // --- STEP 2: Agent Registers Identity ---
        vm.prank(agent1);
        registry.registerAgent("ipfs://QmArbitrageAgentMetadataSpecification");

        assertTrue(registry.isActiveAgent(agent1));
        assertEq(registry.totalAgents(), 1);

        // --- STEP 3: Agent Creates SLA Coverage Terms ---
        vm.prank(agent1);
        uint256 termId = coverageManager.createTerm(
            "High-Frequency Arbitrage Maximum 5% Slippage SLA Bond",
            PREMIUM,
            MAX_PAYOUT,
            DURATION,
            5 // max 5 subscribers
        );

        ICoverageManager.CoverageTerm memory term = coverageManager.getTerm(termId);
        assertEq(term.agent, agent1);
        assertEq(term.maxPayout, MAX_PAYOUT);
        assertEq(term.premiumAmount, PREMIUM);

        // --- STEP 4: User Purchases Coverage Policy ---
        uint256 treasuryBefore = usdc.balanceOf(treasury);
        uint256 agentBalanceBefore = usdc.balanceOf(agent1);

        vm.prank(user1);
        uint256 policyId = coverageManager.purchaseCoverage(termId);

        // Invariant check: Collateral is locked
        assertEq(vault.getLockedCollateral(agent1), MAX_PAYOUT);
        assertEq(vault.getAvailableCollateral(agent1), AGENT_DEPOSIT - MAX_PAYOUT);

        // Fee accounting check (2.5% protocol fee)
        uint256 expectedFee = (PREMIUM * 250) / 10_000;
        assertEq(usdc.balanceOf(treasury) - treasuryBefore, expectedFee);
        assertEq(usdc.balanceOf(agent1) - agentBalanceBefore, PREMIUM - expectedFee);

        // --- STEP 5: Risk Engine Calculates Agent Score ---
        uint256 score = riskEngine.calculateFromRawMetrics(
            vault.getAvailableCollateral(agent1),
            vault.getLockedCollateral(agent1),
            vault.getTotalDeposited(agent1),
            0, // 0 claims paid so far
            1, // 1 current subscriber
            5, // 5 max subscribers
            30 days // age
        );
        assertTrue(score > 7_000, "High collateral agent must have low risk score (>7000 bps)");

        // --- STEP 6: Failure Condition Triggered -> User Submits Claim ---
        bytes32 telemetryHash = keccak256("TxRevertDrawdownProof_Block1984210");
        uint256 claimPayoutRequested = 15_000 * 1e6; // 15,000 USDC claim

        vm.prank(user1);
        uint256 claimId = claimsProcessor.submitClaim(policyId, claimPayoutRequested, telemetryHash);

        IClaimsProcessor.Claim memory claim = claimsProcessor.getClaim(claimId);
        assertEq(claim.claimant, user1);
        assertEq(claim.amount, claimPayoutRequested);
        assertEq(uint8(claim.status), uint8(IClaimsProcessor.ClaimStatus.Submitted));

        // --- STEP 7: Attester Verifies & Approves Parametric Claim ---
        uint256 userBalanceBefore = usdc.balanceOf(user1);

        vm.prank(attester);
        claimsProcessor.approveClaim(claimId);

        // Verify user received payout
        assertEq(usdc.balanceOf(user1) - userBalanceBefore, claimPayoutRequested);

        // Verify policy is marked claimed
        ICoverageManager.Policy memory policy = coverageManager.getPolicy(policyId);
        assertEq(uint8(policy.status), uint8(ICoverageManager.PolicyStatus.Claimed));

        // Verify locked collateral is released (15,000 paid + 5,000 remaining unlocked = 20,000)
        assertEq(vault.getLockedCollateral(agent1), 0);

        // Verify agent registry recorded the claim
        IAgentRegistry.Agent memory agentRecord = registry.getAgent(agent1);
        assertEq(agentRecord.totalClaimsPaid, claimPayoutRequested);

        // --- STEP 8: Protocol Accounting Invariants Hold ---
        assertEq(vault.totalProtocolTvl(), AGENT_DEPOSIT - claimPayoutRequested);
        assertEq(usdc.balanceOf(address(vault)), AGENT_DEPOSIT - claimPayoutRequested);
        assertEq(vault.getAvailableCollateral(agent1), AGENT_DEPOSIT - claimPayoutRequested);
    }
}
