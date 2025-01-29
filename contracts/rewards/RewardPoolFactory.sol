pragma solidity ^0.8.17;

import { RewardPool } from "./RewardPool.sol";

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/*** 
 * @notice - RewardPool Factory contract, which allow a medical researcher to create a new RewardPool contract.
 **/
contract RewardPoolFactory is Ownable {
    RewardPool public rewardPool;

    constructor() Ownable(msg.sender) {}

    /// @dev - Create a new RewardPool contract, which is called by a medical researcher.
    function createNewRewardPool(IERC20 rewardToken, uint256 rewardAmountPerSubmission) public returns (RewardPool _rewardPool) {
        RewardPool rewardPool = new RewardPool(msg.sender, rewardToken, rewardAmountPerSubmission);
        return rewardPool;
    }
}
