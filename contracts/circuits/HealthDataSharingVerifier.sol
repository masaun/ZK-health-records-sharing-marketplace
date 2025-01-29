pragma solidity ^0.8.17;

import { UltraVerifier } from "../../circuits/target/contract.sol"; /// @dev - Deployed-Verifier SC, which was generated based on the main.nr

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";


/*** 
 * @notice - HealthDataSharing Verifier contract
 **/
contract HealthDataSharingVerifier is Ownable {
    UltraVerifier public verifier; /// @dev - This UltraVerifier SC is generated via ZK circuit

    constructor(UltraVerifier _verifier) Ownable(msg.sender) {
        verifier = _verifier;
    }

    function verifyHealthDataSharingProof(bytes calldata proof, bytes32[] calldata publicInput) public view returns (bool) {
        bool proofResult = verifier.verify(proof, publicInput);
        require(proofResult, "Proof is not valid");
        return proofResult;
    }

    /// @dev - Update the UltraVerifier contract, which is generated via the ZK circuit in Noir.
    function updateUltraVerifier(UltraVerifier newVerifier) public onlyOwner returns (UltraVerifier _newVerifier) {
        verifier = newVerifier;
    }
}
