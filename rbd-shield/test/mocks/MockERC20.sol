// SPDX-License-Identifier: MIT
// Author: rbd3
// Title: Mock USDC ERC20 Token
// Project: RBD Shield — Autonomous Risk-Underwriting Protocol

pragma solidity 0.8.37;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockERC20
 * @author rbd3
 * @notice 6-decimal ERC20 token mimicking native USDC on Arbitrum / Robinhood Chain for testing
 */
contract MockERC20 is ERC20 {
    uint8 private immutable CUSTOM_DECIMALS;

    constructor(string memory name, string memory symbol, uint8 customDecimals_) ERC20(name, symbol) {
        CUSTOM_DECIMALS = customDecimals_;
    }

    function decimals() public view override returns (uint8) {
        return CUSTOM_DECIMALS;
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external {
        _burn(from, amount);
    }
}
