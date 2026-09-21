// SPDX-License-Identifier: MIT
// Author: rbd3
// Title: Claims Processor Unit Tests
// Project: RBD Shield — Autonomous Risk-Underwriting Protocol

pragma solidity 0.8.37;

import {Test} from "forge-std/Test.sol";
import {ClaimsProcessor} from "../../src/ClaimsProcessor.sol";
import {CoverageManager} from "../../src/CoverageManager.sol";
import {VaultManager} from "../../src/VaultManager.sol";
import {AgentRegistry} from "../../src/AgentRegistry.sol";
import {MockERC20} from "../mocks/MockERC20.sol";
import {IClaimsProcessor} from "../../src/interfaces/IClaimsProcessor.sol";
import {ICoverageManager} from "../../src/interfaces/ICoverageManager.sol";
import {Errors} from "../../src/libraries/Errors.sol";

contract ClaimsProcessorTest is Test {
    ClaimsProcessor public claimsProcessor;
    CoverageManager public coverageManager;
    VaultManager public vault;
    AgentRegistry public registry;
    MockERC20 public usdc;

    address public admin = address(0xAD);
    address public attester = address(0xAE);
    address public agent1 = address(0xA1);
    address public subscriber = address(0x55);
    address public treasury = address(0x77);

    uint256 public constant INITIAL_BALANCE = 100_000 * 1e6;
    uint256 public constant MAX_PAYOUT = 2_000 * 1e6;
    uint256 public constant CLAIM_AMOUNT = 1_500 * 1e6;
    uint256 public constant PREMIUM = 50 * 1e6;
    uint256 public constant DURATION = 14 days;
    bytes32 public constant EVIDENCE_HASH = keccak256("ArbitrageDrawdownExceededSLA");

    uint256 public termId;
    uint256 public policyId;

    function setUp() public {
        usdc = new MockERC20("USD Coin", "USDC", 6);
        vault = new VaultManager(admin, address(usdc));
        registry = new AgentRegistry(admin, 0);
        coverageManager = new CoverageManager(admin, address(usdc), treasury, address(vault), address(registry));
        claimsProcessor = new ClaimsProcessor(admin, address(vault), address(coverageManager), address(registry));

        bytes32 lockerRole = vault.LOCKER_ROLE();
        bytes32 claimsRole = vault.CLAIMS_EXECUTOR_ROLE();
        bytes32 attesterRole = claimsProcessor.ATTESTER_ROLE();

        vm.startPrank(admin);
        vault.setAgentRegistry(address(registry));
        vault.grantRole(lockerRole, address(coverageManager));
        vault.grantRole(lockerRole, address(claimsProcessor));
        vault.grantRole(claimsRole, address(claimsProcessor));
        registry.grantRole(lockerRole, address(coverageManager));
        registry.grantRole(claimsRole, address(claimsProcessor));
        coverageManager.grantRole(claimsRole, address(claimsProcessor));
        claimsProcessor.grantRole(attesterRole, attester);
        vm.stopPrank();

        // Setup Agent
        usdc.mint(agent1, INITIAL_BALANCE);
        vm.prank(agent1);
        registry.registerAgent("ipfs://Agent1");

        vm.prank(agent1);
        usdc.approve(address(vault), type(uint256).max);

        vm.prank(agent1);
        vault.deposit(10_000 * 1e6);

        // Create Term
        vm.prank(agent1);
        termId = coverageManager.createTerm("Liquidation Defense Bond", PREMIUM, MAX_PAYOUT, DURATION, 10);

        // Setup Subscriber
        usdc.mint(subscriber, INITIAL_BALANCE);
        vm.prank(subscriber);
        usdc.approve(address(coverageManager), type(uint256).max);

        vm.prank(subscriber);
        policyId = coverageManager.purchaseCoverage(termId);
    }

    function test_SubmitClaim_Success() public {
        vm.prank(subscriber);
        uint256 claimId = claimsProcessor.submitClaim(policyId, CLAIM_AMOUNT, EVIDENCE_HASH);

        IClaimsProcessor.Claim memory claim = claimsProcessor.getClaim(claimId);
        assertEq(claim.claimId, 1);
        assertEq(claim.policyId, policyId);
        assertEq(claim.claimant, subscriber);
        assertEq(claim.agent, agent1);
        assertEq(claim.amount, CLAIM_AMOUNT);
        assertEq(claim.evidenceHash, EVIDENCE_HASH);
        assertEq(uint8(claim.status), uint8(IClaimsProcessor.ClaimStatus.Submitted));
        assertEq(claimsProcessor.totalClaims(), 1);
    }

    function test_SubmitClaim_NotHolder_Reverts() public {
        address impostor = address(0x99);
        vm.prank(impostor);
        vm.expectRevert(abi.encodeWithSelector(Errors.NotPolicyHolder.selector, impostor, subscriber));
        claimsProcessor.submitClaim(policyId, CLAIM_AMOUNT, EVIDENCE_HASH);
    }

    function test_SubmitClaim_ExceedsMaxPayout_Reverts() public {
        vm.prank(subscriber);
        vm.expectRevert(abi.encodeWithSelector(Errors.ClaimAmountExceedsMaxPayout.selector, MAX_PAYOUT + 1, MAX_PAYOUT));
        claimsProcessor.submitClaim(policyId, MAX_PAYOUT + 1, EVIDENCE_HASH);
    }

    function test_SubmitClaim_AlreadySubmitted_Reverts() public {
        vm.prank(subscriber);
        claimsProcessor.submitClaim(policyId, CLAIM_AMOUNT, EVIDENCE_HASH);

        vm.prank(subscriber);
        vm.expectRevert(abi.encodeWithSelector(Errors.ClaimAlreadySubmitted.selector, policyId));
        claimsProcessor.submitClaim(policyId, CLAIM_AMOUNT, EVIDENCE_HASH);
    }

    function test_ApproveClaim_Success() public {
        vm.prank(subscriber);
        uint256 claimId = claimsProcessor.submitClaim(policyId, CLAIM_AMOUNT, EVIDENCE_HASH);

        uint256 claimantBalanceBefore = usdc.balanceOf(subscriber);

        vm.prank(attester);
        claimsProcessor.approveClaim(claimId);

        IClaimsProcessor.Claim memory claim = claimsProcessor.getClaim(claimId);
        assertEq(uint8(claim.status), uint8(IClaimsProcessor.ClaimStatus.Paid));

        // Payout transferred
        assertEq(usdc.balanceOf(subscriber) - claimantBalanceBefore, CLAIM_AMOUNT);

        // Policy marked claimed
        ICoverageManager.Policy memory policy = coverageManager.getPolicy(policyId);
        assertEq(uint8(policy.status), uint8(ICoverageManager.PolicyStatus.Claimed));

        // Collateral lock cleared (1500 paid + 500 unlocked = 2000 total lock released)
        assertEq(vault.getLockedCollateral(agent1), 0);
    }

    function test_ApproveClaim_Unauthorized_Reverts() public {
        vm.prank(subscriber);
        uint256 claimId = claimsProcessor.submitClaim(policyId, CLAIM_AMOUNT, EVIDENCE_HASH);

        vm.prank(subscriber);
        vm.expectRevert();
        claimsProcessor.approveClaim(claimId);
    }

    function test_RejectClaim_Success() public {
        vm.prank(subscriber);
        uint256 claimId = claimsProcessor.submitClaim(policyId, CLAIM_AMOUNT, EVIDENCE_HASH);

        vm.prank(attester);
        claimsProcessor.rejectClaim(claimId, "Telemetry proved agent did not violate SLA threshold");

        IClaimsProcessor.Claim memory claim = claimsProcessor.getClaim(claimId);
        assertEq(uint8(claim.status), uint8(IClaimsProcessor.ClaimStatus.Rejected));
        assertEq(claim.rejectionReason, "Telemetry proved agent did not violate SLA threshold");
    }
}
