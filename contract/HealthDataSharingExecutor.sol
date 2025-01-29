pragma solidity ^0.8.17;

import { HealthDataSharingVerifier } from "./circuits/HealthDataSharingVerifier.sol"; /// @dev - Deployed-Verifier SC, which was generated based on the main.nr
import { HealthDataSharingRequester } from "./HealthDataSharingRequester.sol";

import { RewardPool } from "./rewards/RewardPool.sol";


/** 
 * @notice - HealthDataSharing Executor contract
 * @notice - Actors: Wearable Device (i.e. Apple Watch, Pulse) holder, Medical Researcher (and Hospital)
 * @notice - Scenario: a Wearable Device (i.e. Apple Watch, Pulse) holder can send their medical data (i.e. Execise Hours + Blood Presure) to the medical researcher - without revealing extra sensitive personal data on their Smart Watch.
 */
contract HealthDataSharingExecutor {
    HealthDataSharingVerifier public healthDataSharingVerifier;
    HealthDataSharingRequester public healthDataSharingRequester;
    RewardPool public rewardPool;

    uint256 public wearableDeviceHolderId;

    mapping (address => uint256) public wearableDeviceHolders;

    modifier onlyWearableDeviceHolder() {
        require(wearableDeviceHolders[msg.sender] > 0, "Not registered as a wearable device holder");
        _;
    }

    constructor(
        HealthDataSharingVerifier _healthDataSharingVerifier, 
        HealthDataSharingRequester _healthDataSharingRequester,
        RewardPool _rewardPool
    ) {
        healthDataSharingVerifier = _healthDataSharingVerifier;
        healthDataSharingRequester = _healthDataSharingRequester;
        rewardPool = _rewardPool;
    }

    /**
     * @notice - Verify a zkProof to prove a caller is a Wearable Device holder.
     */
    function _verifyHealthDataSharingProof(bytes calldata proof, bytes32[] calldata publicInput) internal view returns (bool) {
        return healthDataSharingVerifier.verifyHealthDataSharingProof(proof, publicInput);
    }

    /**
     * @dev - a Wearable Device holder (i.e. Apple Watch holder, Pulse holder) would submit (= send) their health data to a request, which is created by a Medical Researcher.
     * @dev - Only a Wearable Device holder
     */
    function submitHealthData(
        bytes calldata proof, 
        bytes32[] calldata publicInput, 
        uint256 medicalResearcherId, 
        uint256 healthDataSharingRequestId
    ) public onlyWearableDeviceHolder returns(bool) {
        /// @dev - Check a given proof
        bool result = _verifyHealthDataSharingProof(proof, publicInput);
        require(result == true, "Invalid proofs");

        /// @dev - Check whether or not a given number of public inputs is equal to the number of items, which was requested by a Medical Researcher.
        //require(publicInput.length == healthDataSharingVerifierRequestor.getHealthDataSharingVerifierRequest(medicalResearcherId, healthDataSharingVerifierRequestId), "Invalid number of public inputs");


        /// [TODO]: Implement the logic/function to proceed the health data to be shared.
        /// [Actor]: a Medical Researcher and a Data Provider

        /// @dev - The RewardToken (ERC20) would be distributed to the health data provider (i.e. Wearable Device holder)
        address medicalResearcherAccount = healthDataSharingRequester.getMedicalResearcherById(medicalResearcherId);
        address healthDataProvider = msg.sender;
        uint256 rewardAmount = rewardPool.getRewardData(medicalResearcherAccount).rewardAmountPerSubmission;
        rewardPool.distributeRewardToken(medicalResearcherAccount, healthDataProvider, rewardAmount);
    }


    /** 
     * @notice - Register functionss
     */
    function registerAsWearableDeviceHolder(address account) public returns(uint256 wearableDeviceHolderId) {
        wearableDeviceHolders[account] = wearableDeviceHolderId; 
        wearableDeviceHolderId++;
    }
}
