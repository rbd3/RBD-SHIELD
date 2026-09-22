// SPDX-License-Identifier: MIT
// Author: rbd3
// Title: Protocol Deployment & Initialization Script
// Project: RBD Shield — Autonomous Risk-Underwriting Protocol

pragma solidity 0.8.37;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {AgentRegistry} from "../src/AgentRegistry.sol";
import {VaultManager} from "../src/VaultManager.sol";
import {CoverageManager} from "../src/CoverageManager.sol";
import {ClaimsProcessor} from "../src/ClaimsProcessor.sol";
import {MockERC20} from "../test/mocks/MockERC20.sol";
import {Constants} from "../src/libraries/Constants.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envOr(
            "PRIVATE_KEY",
            uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80) // default anvil key
        );
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deploying RBD Shield Protocol with deployer:", deployer);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy or resolve Mock USDC (6 decimals)
        address usdcAddress = vm.envOr("USDC_ADDRESS", address(0));
        if (usdcAddress == address(0)) {
            MockERC20 mockUsdc = new MockERC20("USD Coin (Mock)", "USDC", 6);
            usdcAddress = address(mockUsdc);
            console.log("Deployed Mock USDC at:", usdcAddress);
            // Mint initial liquidity to deployer
            mockUsdc.mint(deployer, 1_000_000 * 1e6);
        } else {
            console.log("Using existing USDC token at:", usdcAddress);
        }

        // 2. Deploy VaultManager
        VaultManager vault = new VaultManager(deployer, usdcAddress);
        console.log("VaultManager deployed at:", address(vault));

        // 3. Deploy AgentRegistry
        AgentRegistry registry = new AgentRegistry(deployer, Constants.DEFAULT_MIN_STAKE);
        console.log("AgentRegistry deployed at:", address(registry));

        // 4. Deploy CoverageManager (treasury defaults to deployer)
        address treasury = vm.envOr("TREASURY_ADDRESS", deployer);
        CoverageManager coverageManager =
            new CoverageManager(deployer, usdcAddress, treasury, address(vault), address(registry));
        console.log("CoverageManager deployed at:", address(coverageManager));

        // 5. Deploy ClaimsProcessor
        ClaimsProcessor claimsProcessor =
            new ClaimsProcessor(deployer, address(vault), address(coverageManager), address(registry));
        console.log("ClaimsProcessor deployed at:", address(claimsProcessor));

        // 6. Connect cross-contract role permissions
        bytes32 lockerRole = vault.LOCKER_ROLE();
        bytes32 claimsRole = vault.CLAIMS_EXECUTOR_ROLE();
        bytes32 attesterRole = claimsProcessor.ATTESTER_ROLE();

        vault.setAgentRegistry(address(registry));
        registry.setVaultManager(address(vault));

        vault.grantRole(lockerRole, address(coverageManager));
        vault.grantRole(lockerRole, address(claimsProcessor));
        vault.grantRole(claimsRole, address(claimsProcessor));

        registry.grantRole(lockerRole, address(coverageManager));
        registry.grantRole(claimsRole, address(claimsProcessor));

        coverageManager.grantRole(claimsRole, address(claimsProcessor));
        coverageManager.setClaimsProcessor(address(claimsProcessor));
        claimsProcessor.grantRole(attesterRole, deployer);

        console.log("All protocol permissions and roles configured successfully!");

        vm.stopBroadcast();
    }
}
