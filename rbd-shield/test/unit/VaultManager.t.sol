// SPDX-License-Identifier: MIT
// Author: rbd3
// Title: Vault Manager Unit Tests
// Project: RBD Shield — Autonomous Risk-Underwriting Protocol

pragma solidity 0.8.37;

import {Test} from "forge-std/Test.sol";
import {VaultManager} from "../../src/VaultManager.sol";
import {AgentRegistry} from "../../src/AgentRegistry.sol";
import {MockERC20} from "../mocks/MockERC20.sol";
import {IVaultManager} from "../../src/interfaces/IVaultManager.sol";
import {Errors} from "../../src/libraries/Errors.sol";

contract VaultManagerTest is Test {
    VaultManager public vault;
    AgentRegistry public registry;
    MockERC20 public usdc;

    address public admin = address(0xAD);
    address public agent1 = address(0xA1);
    address public agent2 = address(0xA2);
    address public claimant = address(0xC1);
    address public locker = address(0xAA);
    address public claimsExecutor = address(0xBB);

    uint256 public constant INITIAL_BALANCE = 100_000 * 1e6; // 100,000 USDC

    function setUp() public {
        usdc = new MockERC20("USD Coin", "USDC", 6);
        vault = new VaultManager(admin, address(usdc));
        registry = new AgentRegistry(admin, 0);

        bytes32 lockerRole = vault.LOCKER_ROLE();
        bytes32 claimsRole = vault.CLAIMS_EXECUTOR_ROLE();

        vm.startPrank(admin);
        vault.setAgentRegistry(address(registry));
        vault.grantRole(lockerRole, locker);
        vault.grantRole(claimsRole, claimsExecutor);
        vm.stopPrank();

        // Setup agent1
        usdc.mint(agent1, INITIAL_BALANCE);
        vm.prank(agent1);
        registry.registerAgent("ipfs://Agent1");

        vm.prank(agent1);
        usdc.approve(address(vault), type(uint256).max);
    }

    function test_Deposit_Success() public {
        uint256 depositAmt = 5_000 * 1e6;

        vm.prank(agent1);
        vault.deposit(depositAmt);

        assertEq(vault.getTotalDeposited(agent1), depositAmt);
        assertEq(vault.getAvailableCollateral(agent1), depositAmt);
        assertEq(vault.getLockedCollateral(agent1), 0);
        assertEq(vault.totalProtocolTvl(), depositAmt);
        assertEq(usdc.balanceOf(address(vault)), depositAmt);
    }

    function test_Deposit_ZeroAmount_Reverts() public {
        vm.prank(agent1);
        vm.expectRevert(Errors.ZeroAmount.selector);
        vault.deposit(0);
    }

    function test_Deposit_ByAnyAccount_Success() public {
        usdc.mint(agent2, INITIAL_BALANCE);
        vm.prank(agent2);
        usdc.approve(address(vault), type(uint256).max);

        vm.prank(agent2);
        vault.deposit(1_000 * 1e6);

        assertEq(vault.getAvailableCollateral(agent2), 1_000 * 1e6);
    }

    function test_Withdraw_AvailableBalance_Success() public {
        uint256 depositAmt = 5_000 * 1e6;
        uint256 withdrawAmt = 2_000 * 1e6;

        vm.prank(agent1);
        vault.deposit(depositAmt);

        vm.prank(agent1);
        vault.withdraw(withdrawAmt);

        assertEq(vault.getTotalDeposited(agent1), depositAmt - withdrawAmt);
        assertEq(vault.getAvailableCollateral(agent1), depositAmt - withdrawAmt);
        assertEq(vault.totalProtocolTvl(), depositAmt - withdrawAmt);
        assertEq(usdc.balanceOf(agent1), INITIAL_BALANCE - depositAmt + withdrawAmt);
    }

    function test_Withdraw_ExceedsAvailable_Reverts() public {
        uint256 depositAmt = 1_000 * 1e6;

        vm.prank(agent1);
        vault.deposit(depositAmt);

        vm.prank(agent1);
        vm.expectRevert(
            abi.encodeWithSelector(Errors.InsufficientAvailableCollateral.selector, depositAmt, depositAmt + 1)
        );
        vault.withdraw(depositAmt + 1);
    }

    function test_LockCollateral_ByLocker_Success() public {
        uint256 depositAmt = 10_000 * 1e6;
        uint256 lockAmt = 4_000 * 1e6;

        vm.prank(agent1);
        vault.deposit(depositAmt);

        vm.prank(locker);
        vault.lockCollateral(agent1, lockAmt);

        assertEq(vault.getLockedCollateral(agent1), lockAmt);
        assertEq(vault.getAvailableCollateral(agent1), depositAmt - lockAmt);
    }

    function test_LockCollateral_ExceedsAvailable_Reverts() public {
        uint256 depositAmt = 1_000 * 1e6;

        vm.prank(agent1);
        vault.deposit(depositAmt);

        vm.prank(locker);
        vm.expectRevert(
            abi.encodeWithSelector(Errors.InsufficientAvailableCollateral.selector, depositAmt, depositAmt + 100)
        );
        vault.lockCollateral(agent1, depositAmt + 100);
    }

    function test_UnlockCollateral_ByLocker_Success() public {
        uint256 depositAmt = 10_000 * 1e6;
        uint256 lockAmt = 4_000 * 1e6;

        vm.prank(agent1);
        vault.deposit(depositAmt);

        vm.prank(locker);
        vault.lockCollateral(agent1, lockAmt);

        vm.prank(locker);
        vault.unlockCollateral(agent1, 1_500 * 1e6);

        assertEq(vault.getLockedCollateral(agent1), lockAmt - 1_500 * 1e6);
        assertEq(vault.getAvailableCollateral(agent1), depositAmt - (lockAmt - 1_500 * 1e6));
    }

    function test_ExecutePayout_Success() public {
        uint256 depositAmt = 10_000 * 1e6;
        uint256 lockAmt = 4_000 * 1e6;
        uint256 payoutAmt = 2_500 * 1e6;

        vm.prank(agent1);
        vault.deposit(depositAmt);

        vm.prank(locker);
        vault.lockCollateral(agent1, lockAmt);

        vm.prank(claimsExecutor);
        vault.executePayout(agent1, claimant, payoutAmt);

        assertEq(usdc.balanceOf(claimant), payoutAmt);
        assertEq(vault.getLockedCollateral(agent1), lockAmt - payoutAmt);
        assertEq(vault.totalProtocolTvl(), depositAmt - payoutAmt);

        IVaultManager.Vault memory v = vault.getVault(agent1);
        assertEq(v.totalClaimsPaid, payoutAmt);
    }

    function test_ExecutePayout_ExceedsLocked_Reverts() public {
        uint256 depositAmt = 5_000 * 1e6;
        uint256 lockAmt = 1_000 * 1e6;

        vm.prank(agent1);
        vault.deposit(depositAmt);

        vm.prank(locker);
        vault.lockCollateral(agent1, lockAmt);

        vm.prank(claimsExecutor);
        vm.expectRevert(abi.encodeWithSelector(Errors.InsufficientLockedCollateral.selector, lockAmt, lockAmt + 1));
        vault.executePayout(agent1, claimant, lockAmt + 1);
    }

    function testFuzz_DepositWithdraw(uint256 depositAmt, uint256 withdrawAmt) public {
        depositAmt = bound(depositAmt, 1, INITIAL_BALANCE);
        withdrawAmt = bound(withdrawAmt, 1, depositAmt);

        vm.prank(agent1);
        vault.deposit(depositAmt);

        vm.prank(agent1);
        vault.withdraw(withdrawAmt);

        assertEq(vault.getAvailableCollateral(agent1), depositAmt - withdrawAmt);
        assertEq(vault.totalProtocolTvl(), depositAmt - withdrawAmt);
    }
}
