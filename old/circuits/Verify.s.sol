pragma solidity ^0.8.17;

import "forge-std/Script.sol";
import { UltraVerifier } from "../../circuits/target/contract.sol";
import { HealthDataSharingVerifier } from "../../contracts/circuits/HealthDataSharingVerifier.sol";

contract VerifyScript is Script {
    HealthDataSharingVerifier public healthDataSharingVerifier;
    UltraVerifier public verifier;

    function setUp() public {}

    function run() public returns (bool) {
        uint256 deployerPrivateKey = vm.envUint("LOCALHOST_PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        verifier = new UltraVerifier();
        healthDataSharingVerifier = new HealthDataSharingVerifier(verifier);

        string memory proof = vm.readLine("./circuits/proofs/health_data_sharing_proof");
        bytes memory proofBytes = vm.parseBytes(proof);

        bytes32[] memory correct = new bytes32[](2);
        correct[0] = bytes32(0x0000000000000000000000000000000000000000000000000000000000000003);
        correct[1] = correct[0];

        bool result = healthDataSharingVerifier.verifyHealthDataSharingProof(proofBytes, correct);
        return result;
    }
}
