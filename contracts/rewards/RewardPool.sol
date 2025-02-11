pragma solidity ^0.8.17;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";


/*** 
 * @notice - RewardPool Factory contract, which allow a medical researcher to create a new RewardPool contract.
 **/
contract RewardPool is Ownable { /// [TODO]: Add the transferOwnership()

    using SafeERC20 for IERC20;

    struct RewardDataInNativeToken {
        uint256 rewardAmountPerSubmission;
    }

    struct RewardDataInERC20 {
        IERC20 rewardToken;
        uint256 rewardAmountPerSubmission;
    }

    RewardDataInNativeToken public rewardDataInNativeToken;
    mapping (address => RewardDataInERC20) public rewardDataInERC20s; /// [Key]: RewardToken Address

    mapping (address => bool) public depositedEntranceFees;  /// [Key]: medical researcher's address

    uint256 _rewardAmountPerSubmission = 1 * 1e13; /// @dev - 0.00001 EDU

    /**
     * Constructor
     */
    constructor() Ownable(msg.sender) {
        rewardDataInNativeToken.rewardAmountPerSubmission = _rewardAmountPerSubmission;
        /// [TODO]: Add the transferOwnership()
    }

    /// @dev - Deposit the rewards in NativeToken (i.e. $EDU) into this RewardPool contract to be distributed to HealthData providers
    /// @dev - The caller (msg.sender) of this function must be a medical researcher, which is this RewardPool contract creator.
    function depositRewardInNativeToken(
        address payable rewardReceiver /// @dev - Should be a HealthData provider
    ) public returns (bool) {
        RewardDataInNativeToken memory rewardDataInNativeToken;
        require(msg.value == rewardDataInNativeToken.rewardAmountPerSubmission, "Insufficient amount to be deposited as the entrance fee"); 
        (bool success, ) = rewardReceiver.call{ value: rewardDataInNativeToken.rewardAmountPerSubmission }("");
        require(success, "Transfer failed.");

        depositedEntranceFees[msg.sender] = true;
    }

    /// @dev - Deposit the rewardToken (ERC20) into this RewardPool contract to be distributed to HealthData providers
    /// @dev - The caller (msg.sender) of this function must be a medical researcher, which is this RewardPool contract creator.
    function depositRewardInERC20(
        address rewardTokenAddress,
        uint256 amount
    ) public returns (bool) {
        RewardDataInERC20 memory rewardDataInERC20 = rewardDataInERC20s[rewardTokenAddress];
        require(amount == rewardDataInERC20.rewardAmountPerSubmission, "Insufficient amount to be deposited as the entrance fee"); 
        rewardDataInERC20.rewardToken.safeTransferFrom(msg.sender, address(this), amount);
        depositedEntranceFees[msg.sender] = true;
    }

    /// @dev - Distribute the rewardToken (ERC20) to a HealthData provider
    /// @dev - The caller (msg.sender) of this function should be 〜.
    function distributeRewardInERC20(
        address rewardTokenAddress,
        address rewardReceiver /// @dev - Should be a HealthData provider
    ) public returns (bool) {
        RewardDataInERC20 memory rewardDataInERC20 = rewardDataInERC20s[rewardTokenAddress];
        rewardDataInERC20.rewardToken.safeTransfer(rewardReceiver, rewardDataInERC20.rewardAmountPerSubmission);
    }

    function getRewardInNativeToken() public view returns (RewardDataInNativeToken memory _rewardDataInNativeToken) {
        RewardDataInNativeToken memory rewardDataInNativeToken;
        return rewardDataInNativeToken;
    }

    /// @dev - This caller should be a medical researcher
    function validateMedicalResearcherAlreadyPaidEntranceFee() public view returns (bool) {
        return depositedEntranceFees[msg.sender];
    }


    /**
     * Update functions
     */

    /// @dev - Update data of an existing RewardPool contract, which is called by a medical researcher.
    function updateExistingNativeTokenRewardPool(
        uint256 _newRewardAmountPerSubmission
    ) public onlyOwner returns (bool) {
        rewardDataInNativeToken.rewardAmountPerSubmission = _newRewardAmountPerSubmission;
    }
}
