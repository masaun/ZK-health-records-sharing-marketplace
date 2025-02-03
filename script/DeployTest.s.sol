pragma solidity ^0.8.17;

import "forge-std/Script.sol";

/// @dev - ZK (Ultraplonk) circuit, which is generated in Noir.
import { UltraVerifier } from "../circuits/target/contract.sol"; /// @dev - Deployed-Verifier SC, which was generated based on the main.nr


/**
 * @notice - Deployment script to deploy all SCs at once - on EDU Chain (testnet)
 * @dev - [CLI]: forge script script/DeploymentAllContracts.s.sol --broadcast --private-key <your_private_key> --verify <SC source>
 */
contract DeploymentTest is Script {

    UltraVerifier public verifier;

    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("EDU_CHAIN_PRIVATE_KEY");
        //uint256 deployerPrivateKey = vm.envUint("LOCALHOST_PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        new UltraVerifier();
        //verifier = new UltraVerifier();
        
        vm.stopBroadcast();

        /// @dev - Logs of the deployed-contracts on EDU Chain (testnet)
        console.logString("Logs of the deployed-contracts on EDU Chain (testnet)");
        console.logString("\n");
        console.log("%s: %s", "UltraVerifier SC", address(verifier));
        console.logString("\n");
    }
}



////////////////////////////
/// CLI (icl. SC sources)
////////////////////////////

// forge script script/DeployTest.s.sol:DeploymentTest --broadcast --private-key <EDU_CHAIN_PRIVATE_KEY> --rpc-url ${EDU_CHAIN_RPC}
