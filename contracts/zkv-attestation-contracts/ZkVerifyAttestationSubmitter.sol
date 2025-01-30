pragma solidity ^0.8.17;

/// @dev - zkVerify Attestation Contracts
import { IZkVerifyAttestation } from "./zkv-attestation-contracts/interfaces/IZkVerifyAttestation.sol";


/** 
 * @notice - The ZkVerifyAttestationSubmitter contract
 * @notice - The ZkVerifyAttestationSubmitter contract is the specific purpose contract to submit an attestaion to the ZkVerifyAttestation contract.
 * @notice - Actors: ? 
 * @notice - Scenario: ?
 */
contract ZkVerifyAttestationSubmitter {
    IZkVerifyAttestation public zkVerifyAttestation;

    // modifier onlyWearableDeviceHolder() {
    //     require(wearableDeviceHolders[msg.sender] > 0, "Not registered as a wearable device holder");
    //     _;
    // }

    constructor(
        IZkVerifyAttestation _zkVerifyAttestation
    ) {
        zkVerifyAttestation = _zkVerifyAttestation; /// @dev - The ZkVerifyAttestation contract-deployed on EDU Chain
    }

    /**
     * @dev - Submit an given attestaion to the ZkVerifyAttestation contract.
     */
    function submitAttestation(
        uint256 _attestationId,
        bytes32 _proofsAttestation
    ) public returns(bool) {
        zkVerifyAttestation.submitAttestation(_attestationId, _proofsAttestation);
    }

    /**
     * @dev - Submit batch of given attestaions to the ZkVerifyAttestation contract.
     */
     function submitAttestationBatch(
        uint256[] calldata _attestationIds,
        bytes32[] calldata _proofsAttestation
    ) public returns(bool) {
        zkVerifyAttestation.submitAttestationBatch(_attestationIds, _proofsAttestation);
    }
}