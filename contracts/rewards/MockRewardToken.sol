// contracts/GLDToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";


contract MockRewardToken is ERC20, Ownable {

    uint256 initialSupply = 1000000 * 1e18;
    constructor() ERC20("Mock RewardToken", "MOCK_REWARD_TOKEN") Ownable(msg.sender) {
        _mint(msg.sender, initialSupply);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    // function approve(address spender, uint256 amount) external onlyOwner {
    //    _approve(msg.sender, spender, amount);
    // }
}