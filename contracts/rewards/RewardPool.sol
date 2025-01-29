pragma solidity ^0.8.17;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";


/*** 
 * @notice - RewardPool Factory contract, which allow a medical researcher to create a new RewardPool contract.
 **/
contract RewardPool is Ownable { /// [TODO]: Add the transferOwnership()

    using SafeERC20 for IERC20;

    struct RewardData {
        address poolCreator; /// @dev - a medical researcher, who create a new RewardPool contract via the RewardPoolFactory contract
        IERC20 rewardToken;
        uint256 rewardAmountPerSubmission;
    }
    mapping (address => RewardData) public rewardDatas; /// @dev - Key is "poolCreator" (medical researcher) address.

    /// @param _poolCreator - a medical researcher, who create a new RewardPool contract via the RewardPoolFactory contract
    constructor(address _poolCreator, IERC20 _rewardToken, uint256 _rewardAmountPerSubmission) Ownable(msg.sender) {
        RewardData storage rewardData = rewardDatas[_poolCreator];
        rewardData.poolCreator = _poolCreator;
        rewardData.rewardToken;
        rewardData.rewardAmountPerSubmission = _rewardAmountPerSubmission;

        /// [TODO]: Add the transferOwnership()
    }

    /// @dev - Deposit the rewardToken (ERC20) into this RewardPool contract to be distributed to HealthData providers
    /// @dev - The caller (msg.sender) of this function must be a medical researcher, which is this RewardPool contract creator.
    function depositRewardToken(
        uint256 amount
    ) public returns (bool) {
        RewardData memory rewardData = rewardDatas[msg.sender];
        rewardData.rewardToken.safeTransferFrom(msg.sender, address(this), amount);
    }

    /// @dev - Distribute the rewardToken (ERC20) to a HealthData provider
    /// @dev - The caller (msg.sender) of this function should be 〜.
    function distributeRewardToken(
        address poolCreator, /// @dev - medical researcher
        address healthDataProvider,
        uint256 rewardAmount
    ) public returns (bool) { /// [TODO]: Who should be this caller?
        RewardData memory rewardData = rewardDatas[poolCreator];
        rewardData.rewardToken.safeTransfer(healthDataProvider, rewardAmount);
    }

    function getRewardData(address poolCreator) public view returns (RewardData memory _rewardData) {
        RewardData memory rewardData = rewardDatas[poolCreator];
        return rewardData;
    }


    /**
     * Update functions
     */

    /// @dev - Update data of an existing RewardPool contract, which is called by a medical researcher.
    function updateExistingRewardPool(
        //IERC20 _newRewardToken, 
        uint256 _newRewardAmountPerSubmission
    ) public returns (bool) {
        RewardData storage rewardData = rewardDatas[msg.sender];
        //rewardData.poolCreator = _poolCreator;
        //rewardData.newRewardToken = _newRewardToken;
        rewardData.rewardAmountPerSubmission = _newRewardAmountPerSubmission;
    }
}
