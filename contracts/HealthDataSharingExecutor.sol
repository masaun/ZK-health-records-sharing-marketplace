pragma solidity ^0.8.17;

/// @dev - zkVerify Attestation Contracts
import { IZkVerifyAttestation } from "./zkv-attestation-contracts/interfaces/IZkVerifyAttestation.sol";

/// @dev - ZK (Ultraplonk) circuit, which is generated in Noir.
import { HealthDataSharingVerifier } from "./circuits/HealthDataSharingVerifier.sol"; /// @dev - Deployed-Verifier SC, which was generated based on the main.nr
import { HealthDataSharingRequester } from "./HealthDataSharingRequester.sol";

import { RewardPool } from "./rewards/RewardPool.sol";


/** 
 * @notice - HealthDataSharing Executor contract
 * @notice - Actors: Wearable Device (i.e. Apple Watch, Pulse) holder, Medical Researcher (and Hospital)
 * @notice - Scenario: a Wearable Device (i.e. Apple Watch, Pulse) holder can send their medical data (i.e. Execise Hours + Blood Presure) to the medical researcher - without revealing extra sensitive personal data on their Smart Watch.
 */
contract HealthDataSharingExecutor {
    IZkVerifyAttestation public zkVerifyAttestation;
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
        IZkVerifyAttestation _zkVerifyAttestation,
        HealthDataSharingVerifier _healthDataSharingVerifier, 
        HealthDataSharingRequester _healthDataSharingRequester,
        RewardPool _rewardPool
    ) {
        zkVerifyAttestation = _zkVerifyAttestation; /// @dev - The ZkVerifyAttestation contract-deployed on EDU Chain
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
        uint256 healthDataSharingRequestId,
        /// @dev - The parameters below are for the zkVerifyAttestation# verifyProofAttestation()
        uint256 _attestationId,
        bytes32 _leaf,
        bytes32[] calldata _merklePath,
        uint256 _leafCount,
        uint256 _index
    ) public returns(bool) {                            /// [TODO]: After testing on Frontend, this should be removed.
    //) public onlyWearableDeviceHolder returns(bool) { /// [TODO]: After testing on Frontend, this should be resumed.

        /// @dev - Validate a given proof via the Verifier contract, which was generated via the ZK circuit in Noir.
        bool result1 = _verifyHealthDataSharingProof(proof, publicInput);
        require(result1 == true, "Invalid proof");

        /// @dev - Validate a given attestation of a given proof via the Verifier contract, which was generated via the zkVerifier.
        bool result2 = zkVerifyAttestation.verifyProofAttestation(_attestationId, _leaf, _merklePath, _leafCount,_index);
        require(result2 == true, "Invalid attestation of proof");

        /// @dev - Check whether or not a given number of public inputs is equal to the number of items, which was requested by a Medical Researcher.
        //require(publicInput.length == healthDataSharingVerifierRequestor.getHealthDataSharingVerifierRequest(medicalResearcherId, healthDataSharingVerifierRequestId), "Invalid number of public inputs");


        /// [TODO]: Implement the logic/function to proceed the health data to be shared.
        /// [Actor]: a Medical Researcher and a Data Provider

        /// [TODO]: After testing on Frontend, the following code should be resumed.
        /// @dev - The RewardToken (ERC20) would be distributed to the health data provider (i.e. Wearable Device holder)
        // address medicalResearcherAccount = healthDataSharingRequester.getMedicalResearcherById(medicalResearcherId);
        // address healthDataProvider = msg.sender;
        // uint256 rewardAmount = rewardPool.getRewardData(medicalResearcherAccount).rewardAmountPerSubmission;
        // rewardPool.distributeRewardToken(medicalResearcherAccount, healthDataProvider, rewardAmount);
    }


    /** 
     * @notice - Register functions
     */
    function registerAsWearableDeviceHolder(address account) public returns(uint256 wearableDeviceHolderId) {
        wearableDeviceHolders[account] = wearableDeviceHolderId; 
        wearableDeviceHolderId++;
    }
}
