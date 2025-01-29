pragma solidity ^0.8.17;

import "forge-std/Script.sol";
import { UltraVerifier } from "../../circuits/target/contract.sol";
import { HealthDataSharingVerifier } from "../../contracts/circuits/HealthDataSharingVerifier.sol";

contract HealthDataSharingVerifierScript is Script {
    HealthDataSharingVerifier public healthDataSharingVerifier;
    UltraVerifier public verifier;

    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("LOCALHOST_PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        verifier = new UltraVerifier();
        healthDataSharingVerifier = new HealthDataSharingVerifier(verifier);
    }
}
