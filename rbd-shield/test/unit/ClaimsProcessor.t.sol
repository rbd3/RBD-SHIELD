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
        coverageManager.setClaimsProcessor(address(claimsProcessor));
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

    function test_PendingClaim_BlocksPolicyExpiry() public {
        vm.prank(subscriber);
        claimsProcessor.submitClaim(policyId, CLAIM_AMOUNT, EVIDENCE_HASH);

        assertTrue(claimsProcessor.hasPendingClaim(policyId));

        // Warp past policy end time
        ICoverageManager.Policy memory policy = coverageManager.getPolicy(policyId);
        vm.warp(policy.endTime + 1);

        // Attempting to expire policy while claim is pending must revert
        vm.expectRevert(abi.encodeWithSelector(Errors.ClaimPending.selector, policyId));
        coverageManager.expirePolicy(policyId);

        // Invariant: Collateral must remain locked
        assertEq(vault.getLockedCollateral(agent1), MAX_PAYOUT);
    }

    function test_ApproveClaim_AfterPolicyEndTime_Success() public {
        ICoverageManager.Policy memory policy = coverageManager.getPolicy(policyId);

        // A policy-holder may submit at the last valid second, and the attester
        // may resolve it shortly after expiry while still inside the claim window.
        vm.warp(policy.endTime - 1);
        vm.prank(subscriber);
        uint256 claimId = claimsProcessor.submitClaim(policyId, CLAIM_AMOUNT, EVIDENCE_HASH);

        vm.warp(policy.endTime + 1);
        vm.expectRevert(abi.encodeWithSelector(Errors.ClaimPending.selector, policyId));
        coverageManager.expirePolicy(policyId);

        uint256 claimantBalanceBefore = usdc.balanceOf(subscriber);
        vm.prank(attester);
        claimsProcessor.approveClaim(claimId);

        IClaimsProcessor.Claim memory claim = claimsProcessor.getClaim(claimId);
        assertEq(uint8(claim.status), uint8(IClaimsProcessor.ClaimStatus.Paid));
        assertEq(usdc.balanceOf(subscriber) - claimantBalanceBefore, CLAIM_AMOUNT);

        policy = coverageManager.getPolicy(policyId);
        assertEq(uint8(policy.status), uint8(ICoverageManager.PolicyStatus.Claimed));
        assertEq(vault.getLockedCollateral(agent1), 0);
    }

    function test_RejectClaim_AllowsPolicyExpiry_AfterEndTime() public {
        vm.prank(subscriber);
        uint256 claimId = claimsProcessor.submitClaim(policyId, CLAIM_AMOUNT, EVIDENCE_HASH);

        // Warp past policy end time
        ICoverageManager.Policy memory policy = coverageManager.getPolicy(policyId);
        vm.warp(policy.endTime + 1);

        // Expiry is blocked while claim is pending
        vm.expectRevert(abi.encodeWithSelector(Errors.ClaimPending.selector, policyId));
        coverageManager.expirePolicy(policyId);

        // Attester rejects claim
        vm.prank(attester);
        claimsProcessor.rejectClaim(claimId, "Attester verified no downtime occurred");

        assertFalse(claimsProcessor.hasPendingClaim(policyId));

        // Now policy can be expired normally
        coverageManager.expirePolicy(policyId);

        policy = coverageManager.getPolicy(policyId);
        assertEq(uint8(policy.status), uint8(ICoverageManager.PolicyStatus.Expired));

        // Collateral unlocked back to agent
        assertEq(vault.getLockedCollateral(agent1), 0);
    }

    function test_ExpireStaleClaim_RejectsPermissionlesslyAndAllowsPolicyExpiry() public {
        vm.prank(subscriber);
        uint256 claimId = claimsProcessor.submitClaim(policyId, CLAIM_AMOUNT, EVIDENCE_HASH);
        IClaimsProcessor.Claim memory claim = claimsProcessor.getClaim(claimId);

        uint256 deadline = claim.submittedAt + claimsProcessor.CLAIM_RESOLUTION_PERIOD();
        vm.warp(deadline - 1);
        vm.expectRevert(
            abi.encodeWithSelector(Errors.ClaimResolutionDeadlineNotReached.selector, claimId, deadline, deadline - 1)
        );
        claimsProcessor.expireStaleClaim(claimId);

        vm.warp(deadline);
        address permissionlessCaller = address(0xB0B);
        vm.prank(permissionlessCaller);
        claimsProcessor.expireStaleClaim(claimId);

        claim = claimsProcessor.getClaim(claimId);
        assertEq(uint8(claim.status), uint8(IClaimsProcessor.ClaimStatus.Rejected));
        assertEq(claim.rejectionReason, "Claim resolution deadline elapsed");
        assertFalse(claimsProcessor.hasPendingClaim(policyId));

        ICoverageManager.Policy memory policy = coverageManager.getPolicy(policyId);
        vm.warp(policy.endTime);
        coverageManager.expirePolicy(policyId);

        policy = coverageManager.getPolicy(policyId);
        assertEq(uint8(policy.status), uint8(ICoverageManager.PolicyStatus.Expired));
        assertEq(vault.getLockedCollateral(agent1), 0);
    }

    function test_ApproveClaim_BeforeResolutionDeadline_Succeeds() public {
        vm.prank(subscriber);
        uint256 claimId = claimsProcessor.submitClaim(policyId, CLAIM_AMOUNT, EVIDENCE_HASH);
        IClaimsProcessor.Claim memory claim = claimsProcessor.getClaim(claimId);

        vm.warp(claim.submittedAt + claimsProcessor.CLAIM_RESOLUTION_PERIOD() - 1);
        vm.prank(attester);
        claimsProcessor.approveClaim(claimId);

        claim = claimsProcessor.getClaim(claimId);
        assertEq(uint8(claim.status), uint8(IClaimsProcessor.ClaimStatus.Paid));
    }

    // --- Claim Submission and Resolution Boundary Tests ---

    function test_ApproveClaim_AtResolutionDeadline_Reverts() public {
        vm.prank(subscriber);
        uint256 claimId = claimsProcessor.submitClaim(policyId, CLAIM_AMOUNT, EVIDENCE_HASH);
        IClaimsProcessor.Claim memory claim = claimsProcessor.getClaim(claimId);
        uint256 deadline = claim.submittedAt + claimsProcessor.CLAIM_RESOLUTION_PERIOD();

        vm.warp(deadline);
        vm.prank(attester);
        vm.expectRevert(
            abi.encodeWithSelector(Errors.ClaimResolutionDeadlineExpired.selector, claimId, deadline, deadline)
        );
        claimsProcessor.approveClaim(claimId);

        claim = claimsProcessor.getClaim(claimId);
        assertEq(uint8(claim.status), uint8(IClaimsProcessor.ClaimStatus.Submitted));
        assertTrue(claimsProcessor.hasPendingClaim(policyId));
    }

    function test_SubmitClaim_AtExactEndTime_Reverts() public {
        ICoverageManager.Policy memory policy = coverageManager.getPolicy(policyId);
        vm.warp(policy.endTime);

        vm.prank(subscriber);
        vm.expectRevert(abi.encodeWithSelector(Errors.PolicyAlreadyExpired.selector, policyId));
        claimsProcessor.submitClaim(policyId, CLAIM_AMOUNT, EVIDENCE_HASH);
    }

    function test_SubmitClaim_OneSecondBeforeEndTime_Success() public {
        ICoverageManager.Policy memory policy = coverageManager.getPolicy(policyId);
        // Warp to 1 second before policy.endTime
        vm.warp(policy.endTime - 1);

        vm.prank(subscriber);
        uint256 claimId = claimsProcessor.submitClaim(policyId, CLAIM_AMOUNT, EVIDENCE_HASH);
        assertEq(claimId, 1);

        IClaimsProcessor.Claim memory claim = claimsProcessor.getClaim(claimId);
        assertEq(claim.amount, CLAIM_AMOUNT);
        assertEq(uint8(claim.status), uint8(IClaimsProcessor.ClaimStatus.Submitted));
    }
}
