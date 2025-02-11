pragma solidity ^0.8.17;

/// @dev - zkVerify Attestation Contracts
import { IZkVerifyAttestation } from "./zkv-attestation-contracts/interfaces/IZkVerifyAttestation.sol";

/// @dev - ZK (Ultraplonk) circuit, which is generated in Noir.
import { HealthDataSharingVerifier } from "./circuits/HealthDataSharingVerifier.sol"; /// @dev - Deployed-Verifier SC, which was generated based on the main.nr
import { HealthDataSharingRequester } from "./HealthDataSharingRequester.sol";

import { RewardPool } from "./rewards/RewardPool.sol";
import { DataTypes } from "./libraries/DataTypes.sol";


/** 
 * @notice - HealthDataSharing Executor contract
 * @notice - Actors: Health Data Provider (i.e. Patient, Wearable Device holder), Medical Researcher.
 * @notice - Scenario: a Health Data Provider can send their medical data (i.e. race type, blood presure) to the medical researcher - without revealing extra sensitive personal data on their Smart Watch.
 */
contract HealthDataSharingExecutor {
    IZkVerifyAttestation public zkVerifyAttestation;
    HealthDataSharingVerifier public healthDataSharingVerifier;
    HealthDataSharingRequester public healthDataSharingRequester;
    RewardPool public rewardPool;

    uint256 public healthDataProviderId;

    mapping (address => uint256) public healthDataProviders;
    mapping (uint256 => DataTypes.PublicInput) public publicInputStorages; /// [Key]: attestationId (uint256)
    mapping (uint256 => DataTypes.HealthDataDecodedReceived) public HealthDataDecodedReceivedStorages;  /// [Key]: attestationId (uint256)
    //mapping (uint256 => mapping(address => DataTypes.HealthDataDecodedReceived)) public HealthDataDecodedReceivedStorages;      /// [Key]: attestationId (uint256)

    modifier onlyHealthDataProvider() {
        require(healthDataProviders[msg.sender] > 0, "Not registered as a health data provider");
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
     * @dev - a Health Data Provider (i.e. Patient, Wearable Device holder) would submit (= send) their health data to a request, which is created by a Medical Researcher.
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
    //) public onlyHealthDataProvider returns(bool) { /// [TODO]: After testing on Frontend, this should be resumed.

        /// @dev - Validate a given proof via the Verifier contract, which was generated via the ZK circuit in Noir.
        bool result1 = _verifyHealthDataSharingProof(proof, publicInput);
        require(result1 == true, "Invalid proof");

        /// @dev - Validate a given attestation of a given proof via the Verifier contract, which was generated via the zkVerifier.
        bool result2 = zkVerifyAttestation.verifyProofAttestation(_attestationId, _leaf, _merklePath, _leafCount,_index);
        require(result2 == true, "Invalid attestation of proof");

        /// @dev - Check whether or not a given number of public inputs is equal to the number of items, which was requested by a Medical Researcher.
        //require(publicInput.length == healthDataSharingVerifierRequestor.getHealthDataSharingVerifierRequest(medicalResearcherId, healthDataSharingVerifierRequestId), "Invalid number of public inputs");

        /// @dev - Store the publicInput (health data) to be shared into the mapping storage (= publicInputStorages[_attestationId]).
        DataTypes.PublicInput storage publicInputStorage = publicInputStorages[_attestationId];
        publicInputStorage.proof = proof;
        publicInputStorage.publicInput = publicInput;
    }

    /**
     * @dev - Get a HealthDataDecodedReceived from the mapping storage.
     */
    function getHealthDataDecodedReceived(uint256 _attestationId) public view returns(DataTypes.HealthDataDecodedReceived memory healthDataDecodedReceivedStorage) {
        /// @dev - Store a given caller address ("msg.sender") into a "medicalResearcher".
        //address medicalResearcher = msg.sender;

        /// @dev - Store the decoded-publicInput into the HealthDataDecodedReceived storage
        DataTypes.HealthDataDecodedReceived memory healthDataDecodedReceivedStorage = HealthDataDecodedReceivedStorages[_attestationId];
        //DataTypes.HealthDataDecodedReceived memory healthDataDecodedReceivedStorage = HealthDataDecodedReceivedStorages[_attestationId][medicalResearcher]; /// @dev - medicalResearcher is "msg.sender"
    }

    /**
     * @dev - Get a publicInput (health data) from the mapping storage.
     */
    function getHealthData(uint256 _attestationId) public view returns(DataTypes.PublicInput memory publicInputStorage) {
        DataTypes.PublicInput memory publicInputStorage = publicInputStorages[_attestationId];
        return publicInputStorage;
    }  

    /**
     * @dev - a Medical Researcher would receive the health data, which was submitted by the Health Data Providers (i.e. Patients, Wearable Device holders).
     */
    function receiveHealthData(uint256 _attestationId) public returns(bool) { /// [NOTE]: This function should be called by a medical researcher
        /// @dev - Store a given caller address ("msg.sender") into a "medicalResearcher".
        address medicalResearcher = msg.sender;

        /// @dev - Get a publicInput (health data) from the mapping storage.
        DataTypes.PublicInput memory publicInputStorage = getHealthData(_attestationId);
        bytes memory proof = publicInputStorage.proof;
        bytes32[] memory publicInput = publicInputStorage.publicInput;

        /// @dev - Decode publicInput, which is stored in the (mapping) storage.
        DataTypes.HealthDataDecoded memory healthDataDecoded = _decodePublicInput(_attestationId);

        /// @dev - Store the decoded-publicInput into the HealthDataDecodedReceived storage
        DataTypes.HealthDataDecodedReceived storage healthDataDecodedReceivedStorage = HealthDataDecodedReceivedStorages[_attestationId];
        //DataTypes.HealthDataDecodedReceived storage healthDataDecodedReceivedStorage = HealthDataDecodedReceivedStorages[_attestationId][medicalResearcher]; /// @dev - medicalResearcher is "msg.sender"

        /// [TODO]: Add the event to retrieve the "healthDataDecoded" on Frontend.

        /// @dev - The RewardToken (in NativeToken (EDU)) would be distributed to the health data provider (i.e. Patient, Wearable Device holder)
        if (healthDataDecoded.walletAddress != address(0)) {
            address healthDataProvider = healthDataDecoded.walletAddress;
            //address medicalResearcher = healthDataSharingRequester.getMedicalResearcherById(medicalResearcherId);
            uint256 rewardAmountPerSubmission = 1 * 1e13; /// @dev - 0.00001 EDU
            //uint256 rewardAmount = rewardPool.getRewardData(medicalResearcher).rewardAmountPerSubmission;
            //rewardPool.distributeRewardToken(medicalResearcherAccount, healthDataProvider, rewardAmount);

            //bytes memory payload = abi.encodeWithSignature("deposit()");
            (bool success, ) = healthDataProvider.call{ value: rewardAmountPerSubmission }("");
            //(bool success, ) = ealthDataProvider.call{ value: rewardAmountPerSubmission, gas: 100000}(payload);
            require(success);
        }
    }

    /** 
     * @notice - Decode publicInput
     */
    function _decodePublicInput(uint256 _attestationId) internal view returns(DataTypes.HealthDataDecoded memory _healthDataDecoded) { /// [NOTE]: This function should be called by a medical researcher
        /// @dev - Get a publicInput (health data) from the mapping storage.
        DataTypes.PublicInput memory publicInputStorage = getHealthData(_attestationId);
        bytes memory proof = publicInputStorage.proof;
        bytes32[] memory publicInput = publicInputStorage.publicInput;

        /// @dev - Decode publicInput
        DataTypes.HealthDataDecoded memory healthDataDecoded;
        for (uint i=0; i < publicInput.length; i++) {
            if (i == 0) {
                (healthDataDecoded.productId) = abi.decode(bytes32ToBytes(publicInput[i]), (uint64));
            } else if (i == 1) {
                (healthDataDecoded.providerId) = abi.decode(bytes32ToBytes(publicInput[i]), (uint64));
            } else if (i == 2) {
                (healthDataDecoded.name) = abi.decode(bytes32ToBytes(publicInput[i]), (uint32));
            } else if (i == 3) {
                (healthDataDecoded.walletAddress) = abi.decode(bytes32ToBytes(publicInput[i]), (address));
            } else if (i == 4) {
                (healthDataDecoded.height) = abi.decode(bytes32ToBytes(publicInput[i]), (uint8));
            } else if (i == 5) {
                (healthDataDecoded.weight) = abi.decode(bytes32ToBytes(publicInput[i]), (uint8));
            } else if (i == 6) {
                (healthDataDecoded.age) = abi.decode(bytes32ToBytes(publicInput[i]), (uint8));
            } else if (i == 7) {
                (healthDataDecoded.gender) = abi.decode(bytes32ToBytes(publicInput[i]), (uint8));
            } else if (i == 8) {
                (healthDataDecoded.race_type) = abi.decode(bytes32ToBytes(publicInput[i]), (uint8));
            } else if (i == 9) {
                (healthDataDecoded.blood_type) = abi.decode(bytes32ToBytes(publicInput[i]), (uint8));
            } else if (i == 10) {
                (healthDataDecoded.blood_pressure) = abi.decode(bytes32ToBytes(publicInput[i]), (uint8));
            } else if (i == 11) {
                (healthDataDecoded.heart_rate) = abi.decode(bytes32ToBytes(publicInput[i]), (uint8));
            } else if (i == 12) {
                (healthDataDecoded.average_hours_of_sleep) = abi.decode(bytes32ToBytes(publicInput[i]), (uint8));
            } else if (i == 13) {
                (healthDataDecoded.returnValueFromZkCircuit) = abi.decode(bytes32ToBytes(publicInput[i]), (uint64));
            }
        }

        return healthDataDecoded;
    }

    /** 
     * @notice - Convert bytes32 to bytes
     */
    function bytes32ToBytes(bytes32 data) public pure returns (bytes memory) {
        bytes memory result = new bytes(32);
        assembly {
            mstore(add(result, 32), data)
        }
        return result;
    }


    /** 
     * @notice - Register functions
     */
    function registerAsHealthDataProvider(address account) public returns(uint256 healthDataProviderId) {
        healthDataProviders[account] = healthDataProviderId; 
        healthDataProviderId++;
    }
}
