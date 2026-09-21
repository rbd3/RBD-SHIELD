// SPDX-License-Identifier: MIT
// Author: rbd3
// Title: Coverage Manager Unit Tests
// Project: RBD Shield — Autonomous Risk-Underwriting Protocol

pragma solidity 0.8.37;

import {Test} from "forge-std/Test.sol";
import {CoverageManager} from "../../src/CoverageManager.sol";
import {VaultManager} from "../../src/VaultManager.sol";
import {AgentRegistry} from "../../src/AgentRegistry.sol";
import {MockERC20} from "../mocks/MockERC20.sol";
import {ICoverageManager} from "../../src/interfaces/ICoverageManager.sol";
import {Errors} from "../../src/libraries/Errors.sol";

contract CoverageManagerTest is Test {
    CoverageManager public coverageManager;
    VaultManager public vault;
    AgentRegistry public registry;
    MockERC20 public usdc;

    address public admin = address(0xAD);
    address public agent1 = address(0xA1);
    address public subscriber = address(0x55);
    address public treasury = address(0x77);

    uint256 public constant INITIAL_BALANCE = 100_000 * 1e6;
    uint256 public constant MAX_PAYOUT = 1_000 * 1e6; // 1,000 USDC
    uint256 public constant PREMIUM = 20 * 1e6;       // 20 USDC
    uint256 public constant DURATION = 30 days;
    uint256 public constant MAX_SUBSCRIBERS = 5;

    function setUp() public {
        usdc = new MockERC20("USD Coin", "USDC", 6);
        vault = new VaultManager(admin, address(usdc));
        registry = new AgentRegistry(admin, 0);

        coverageManager = new CoverageManager(
            admin,
            address(usdc),
            treasury,
            address(vault),
            address(registry)
        );

        bytes32 lockerRole = vault.LOCKER_ROLE();

        vm.startPrank(admin);
        vault.setAgentRegistry(address(registry));
        vault.grantRole(lockerRole, address(coverageManager));
        registry.grantRole(lockerRole, address(coverageManager));
        vm.stopPrank();

        // Setup Agent 1
        usdc.mint(agent1, INITIAL_BALANCE);
        vm.prank(agent1);
        registry.registerAgent("ipfs://Agent1");

        vm.prank(agent1);
        usdc.approve(address(vault), type(uint256).max);

        vm.prank(agent1);
        vault.deposit(10_000 * 1e6); // 10,000 USDC deposited

        // Setup Subscriber
        usdc.mint(subscriber, INITIAL_BALANCE);
        vm.prank(subscriber);
        usdc.approve(address(coverageManager), type(uint256).max);
    }

    function test_CreateTerm_Success() public {
        vm.prank(agent1);
        uint256 termId = coverageManager.createTerm(
            "Arbitrage SLA Bond",
            PREMIUM,
            MAX_PAYOUT,
            DURATION,
            MAX_SUBSCRIBERS
        );

        ICoverageManager.CoverageTerm memory term = coverageManager.getTerm(termId);
        assertEq(term.termId, 1);
        assertEq(term.agent, agent1);
        assertEq(term.maxPayout, MAX_PAYOUT);
        assertEq(term.premiumAmount, PREMIUM);
        assertEq(term.duration, DURATION);
        assertEq(term.maxSubscribers, MAX_SUBSCRIBERS);
        assertEq(term.currentSubscribers, 0);
        assertTrue(term.active);
    }

    function test_CreateTerm_InvalidDuration_Reverts() public {
        vm.prank(agent1);
        vm.expectRevert(abi.encodeWithSelector(Errors.InvalidDuration.selector, 10 minutes));
        coverageManager.createTerm("Too short", PREMIUM, MAX_PAYOUT, 10 minutes, MAX_SUBSCRIBERS);
    }

    function test_PurchaseCoverage_Success() public {
        vm.prank(agent1);
        uint256 termId = coverageManager.createTerm(
            "Arbitrage SLA Bond",
            PREMIUM,
            MAX_PAYOUT,
            DURATION,
            MAX_SUBSCRIBERS
        );

        uint256 agentBalanceBefore = usdc.balanceOf(agent1);
        uint256 treasuryBalanceBefore = usdc.balanceOf(treasury);

        vm.prank(subscriber);
        uint256 policyId = coverageManager.purchaseCoverage(termId);

        // Verify policy state
        ICoverageManager.Policy memory policy = coverageManager.getPolicy(policyId);
        assertEq(policy.policyId, 1);
        assertEq(policy.termId, termId);
        assertEq(policy.user, subscriber);
        assertEq(policy.agent, agent1);
        assertEq(policy.maxPayout, MAX_PAYOUT);
        assertEq(policy.premiumPaid, PREMIUM);
        assertEq(uint8(policy.status), uint8(ICoverageManager.PolicyStatus.Active));
        assertTrue(coverageManager.isPolicyActive(policyId));

        // Verify collateral locked
        assertEq(vault.getLockedCollateral(agent1), MAX_PAYOUT);

        // Verify fee distribution (2.5% fee to treasury, rest to agent)
        uint256 expectedFee = (PREMIUM * 250) / 10_000;
        assertEq(usdc.balanceOf(treasury) - treasuryBalanceBefore, expectedFee);
        assertEq(usdc.balanceOf(agent1) - agentBalanceBefore, PREMIUM - expectedFee);
    }

    function test_PurchaseCoverage_TermNotActive_Reverts() public {
        vm.prank(agent1);
        uint256 termId = coverageManager.createTerm(
            "Arbitrage SLA Bond",
            PREMIUM,
            MAX_PAYOUT,
            DURATION,
            MAX_SUBSCRIBERS
        );

        vm.prank(agent1);
        coverageManager.setTermStatus(termId, false);

        vm.prank(subscriber);
        vm.expectRevert(abi.encodeWithSelector(Errors.TermNotActive.selector, termId));
        coverageManager.purchaseCoverage(termId);
    }

    function test_PurchaseCoverage_MaxSubscribers_Reverts() public {
        vm.prank(agent1);
        uint256 termId = coverageManager.createTerm(
            "Limited Capacity Bond",
            PREMIUM,
            MAX_PAYOUT,
            DURATION,
            1 // max 1 subscriber
        );

        vm.prank(subscriber);
        coverageManager.purchaseCoverage(termId);

        address subscriber2 = address(0x56);
        usdc.mint(subscriber2, INITIAL_BALANCE);
        vm.prank(subscriber2);
        usdc.approve(address(coverageManager), type(uint256).max);

        vm.prank(subscriber2);
        vm.expectRevert(abi.encodeWithSelector(Errors.MaxSubscribersReached.selector, 1, 1));
        coverageManager.purchaseCoverage(termId);
    }

    function test_ExpirePolicy_BeforeEndTime_Reverts() public {
        vm.prank(agent1);
        uint256 termId = coverageManager.createTerm(
            "Arbitrage SLA Bond",
            PREMIUM,
            MAX_PAYOUT,
            DURATION,
            MAX_SUBSCRIBERS
        );

        vm.prank(subscriber);
        uint256 policyId = coverageManager.purchaseCoverage(termId);

        vm.expectRevert();
        coverageManager.expirePolicy(policyId);
    }

    function test_ExpirePolicy_AfterEndTime_Success() public {
        vm.prank(agent1);
        uint256 termId = coverageManager.createTerm(
            "Arbitrage SLA Bond",
            PREMIUM,
            MAX_PAYOUT,
            DURATION,
            MAX_SUBSCRIBERS
        );

        vm.prank(subscriber);
        uint256 policyId = coverageManager.purchaseCoverage(termId);

        assertEq(vault.getLockedCollateral(agent1), MAX_PAYOUT);

        // Warp time past expiry
        vm.warp(block.timestamp + DURATION + 1);

        coverageManager.expirePolicy(policyId);

        ICoverageManager.Policy memory policy = coverageManager.getPolicy(policyId);
        assertEq(uint8(policy.status), uint8(ICoverageManager.PolicyStatus.Expired));
        assertFalse(coverageManager.isPolicyActive(policyId));

        // Verify collateral unlocked
        assertEq(vault.getLockedCollateral(agent1), 0);
    }
}
