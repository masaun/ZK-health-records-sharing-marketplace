pragma solidity ^0.8.17;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

import { DataTypes } from "../libraries/DataTypes.sol";


/*** 
 * @notice - RewardPool Factory contract, which allow a medical researcher to create a new RewardPool contract.
 **/
contract RewardPool is Ownable { /// [TODO]: Add the transferOwnership()

    using SafeERC20 for IERC20;

    DataTypes.RewardDataInNativeToken public rewardDataInNativeToken;
    mapping (address => DataTypes.RewardDataInERC20) public rewardDataInERC20s; /// [Key]: RewardToken Address

    mapping (address => bool) public depositedEntranceFees;  /// [Key]: medical researcher's address

    uint256 _entranceFee = 1 * 1e13; /// @dev - 0.00001 EDU
    uint256 _rewardAmountPerSubmission = 1 * 1e10; /// @dev - 0.00000001 EDU

    /**
     * Constructor
     */
    constructor() Ownable(msg.sender) {
        rewardDataInNativeToken.entranceFee = _entranceFee;
        rewardDataInNativeToken.rewardAmountPerSubmission = _rewardAmountPerSubmission;
        /// [TODO]: Add the transferOwnership()
    }

    /// @dev - Deposit the rewards in NativeToken (i.e. $EDU) into this RewardPool contract to be distributed to HealthData providers
    /// @dev - The caller (msg.sender) of this function must be a medical researcher, which is this RewardPool contract creator.
    function depositRewardInNativeToken(
        address payable rewardReceiver /// @dev - Should be a HealthData provider
    ) public payable returns (bool) {
        DataTypes.RewardDataInNativeToken memory rewardDataInNativeToken;
        require(msg.value >= rewardDataInNativeToken.entranceFee, "Insufficient amount to be deposited as the entrance fee"); 
        depositedEntranceFees[msg.sender] = true;
    }

    /// @dev - Distribute the rewardToken (in NativeToken) to a HealthData provider
    /// @dev - The caller (msg.sender) of this function should be 〜.
    function distributeRewardInNativeToken(
        address payable rewardReceiver /// @dev - Should be a HealthData provider
    ) public payable returns (bool) {
        DataTypes.RewardDataInNativeToken memory rewardDataInNativeToken;
        require(address(this).balance == rewardDataInNativeToken.rewardAmountPerSubmission, "Insufficient NativeToken balance of this RewardPool contract for distributing the rewards"); 
        (bool success, ) = rewardReceiver.call{ value: rewardDataInNativeToken.rewardAmountPerSubmission }("");
        require(success, "Transfer failed.");
    }

    /// @dev - Deposit the rewardToken (ERC20) into this RewardPool contract to be distributed to HealthData providers
    /// @dev - The caller (msg.sender) of this function must be a medical researcher, which is this RewardPool contract creator.
    function depositRewardInERC20(
        address rewardTokenAddress,
        uint256 amount
    ) public returns (bool) {
        DataTypes.RewardDataInERC20 memory rewardDataInERC20 = rewardDataInERC20s[rewardTokenAddress];
        require(amount >= rewardDataInERC20.entranceFee, "Insufficient amount to be deposited as the entrance fee"); 
        rewardDataInERC20.rewardToken.safeTransferFrom(msg.sender, address(this), amount);
        depositedEntranceFees[msg.sender] = true;
    }

    /// @dev - Distribute the rewardToken (ERC20) to a HealthData provider
    /// @dev - The caller (msg.sender) of this function should be 〜.
    function distributeRewardInERC20(
        address rewardTokenAddress,
        address rewardReceiver /// @dev - Should be a HealthData provider
    ) public returns (bool) {
        DataTypes.RewardDataInERC20 memory rewardDataInERC20 = rewardDataInERC20s[rewardTokenAddress];
        rewardDataInERC20.rewardToken.safeTransfer(rewardReceiver, rewardDataInERC20.rewardAmountPerSubmission);
    }

    function getRewardInNativeToken() public view returns (DataTypes.RewardDataInNativeToken memory _rewardDataInNativeToken) {
        DataTypes.RewardDataInNativeToken memory rewardDataInNativeToken;
        return rewardDataInNativeToken;
    }

    /// @dev - This caller should be a medical researcher
    function validateMedicalResearcherAlreadyPaidEntranceFee(address medicalResearcher) public view returns (bool) {
        require(msg.sender == medicalResearcher, "A given medical researcher address must be same with the caller address");
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
