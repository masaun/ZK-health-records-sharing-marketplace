pragma solidity ^0.8.17;

import "forge-std/Script.sol";

/// @dev - zkVerify Attestation Contracts
import { IZkVerifyAttestation } from "../contracts/zkv-attestation-contracts/interfaces/IZkVerifyAttestation.sol";

/// @dev - ZK (Ultraplonk) circuit, which is generated in Noir.
import { UltraVerifier } from "../circuits/target/contract.sol"; /// @dev - Deployed-Verifier SC, which was generated based on the main.nr
import { HealthDataSharingVerifier } from "../contracts/circuits/HealthDataSharingVerifier.sol";

//import { HealthDataSharingRequester } from "../contracts/HealthDataSharingRequester.sol";
import { HealthDataSharingExecutor } from "../contracts/HealthDataSharingExecutor.sol";

import { RewardPoolFactory } from "../contracts/rewards/RewardPoolFactory.sol";
import { RewardPool } from "../contracts/rewards/RewardPool.sol";
import { MockRewardToken } from "../contracts/rewards/MockRewardToken.sol";

import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";


/**
 * @notice - Deployment script to deploy all SCs at once - on EDU Chain (testnet)
 * @dev - [CLI]: forge script script/DeploymentAllContracts.s.sol --broadcast --private-key <your_private_key> --verify <SC source>
 */
contract DeploymentAllContracts is Script {
    using SafeERC20 for MockRewardToken;

    IZkVerifyAttestation public zkVerifyAttestation;

    UltraVerifier public verifier;
    HealthDataSharingVerifier public healthDataSharingVerifier;
    //HealthDataSharingRequester public healthDataSharingRequester;
    HealthDataSharingExecutor public healthDataSharingExecutor;
    //RewardPoolFactory public rewardPoolFactory;
    //RewardPool public rewardPool;
    //MockRewardToken public rewardToken;

    /// @dev - Deployed-SC address on EDU Chain
    address _zkVerifyAttestation = 0x147AD899D1773f5De5e064C33088b58c7acb7acf; /// @dev - Source: https://docs.zkverify.io/relevant_links#zkverify-links

    function setUp() public {}

    function run() public {
        vm.createSelectFork("educhain-testnet");
        //vm.createSelectFork("educhain-testnet");
        //uint256 deployerPrivateKey = vm.envUint("EDU_CHAIN_PRIVATE_KEY");
        //uint256 deployerPrivateKey = vm.envUint("LOCALHOST_PRIVATE_KEY");
        //vm.startBroadcast(deployerPrivateKey);

        vm.startBroadcast();
        //rewardPoolFactory = new RewardPoolFactory();
        //rewardToken = new MockRewardToken();

        /// @dev - Create new RwardPool contract
        //uint256 rewardAmountPerSubmission = 5 * 1e18; /// @dev - 5 RewardToken
        //rewardPool = rewardPoolFactory.createNewRewardPool(rewardToken, rewardAmountPerSubmission);

        zkVerifyAttestation = IZkVerifyAttestation(_zkVerifyAttestation); /// @dev - The ZkVerifyAttestation contract-deployed on EDU Chain
        verifier = new UltraVerifier();
        healthDataSharingVerifier = new HealthDataSharingVerifier(verifier);
        //healthDataSharingRequester = new HealthDataSharingRequester(healthDataSharingVerifier);
        healthDataSharingExecutor = new HealthDataSharingExecutor(zkVerifyAttestation, healthDataSharingVerifier);
        //healthDataSharingExecutor = new HealthDataSharingExecutor(zkVerifyAttestation, healthDataSharingVerifier, healthDataSharingRequester, rewardPool);

        vm.stopBroadcast();

        /// @dev - Logs of the deployed-contracts on EDU Chain (testnet)
        console.logString("Logs of the deployed-contracts on EDU Chain (testnet)");
        console.logString("\n");
        //console.log("%s: %s", "RewardPoolFactory SC", address(rewardPoolFactory));
        //console.logString("\n");
        //console.log("%s: %s", "RewardPool SC", address(rewardPool));
        //console.logString("\n");
        console.log("%s: %s", "ZkVerifyAttestation SC (on EDU Chain's testnet)", address(zkVerifyAttestation));
        console.logString("\n");
        console.log("%s: %s", "UltraVerifier SC", address(verifier));
        console.logString("\n");
        console.log("%s: %s", "HealthDataSharingVerifier SC", address(healthDataSharingVerifier));
        console.logString("\n");
        //console.log("%s: %s", "HealthDataSharingRequester SC", address(healthDataSharingRequester));
        //console.logString("\n");
        console.log("%s: %s", "HealthDataSharingExecutor SC", address(healthDataSharingExecutor));
        console.logString("\n");
    }
}



/////////////////////////////////////////
/// CLI (icl. SC sources) - New version
//////////////////////////////////////

// forge script script/DeploymentAllContracts.s.sol --broadcast --private-key <EDU_CHAIN_PRIVATE_KEY> \
//     ./contracts/zkv-attestation-contracts/interfaces/IZkVerifyAttestation.sol:ZkVerifyAttestation \
//     ./circuits/target/contract.sol:UltraVerifier \
//     ./contracts/circuits/HealthDataSharingVerifier.sol:HealthDataSharingVerifier \
//     ./contracts/HealthDataSharingExecutor.sol:HealthDataSharingExecutor --skip-simulation



/////////////////////////////////////////
/// CLI (icl. SC sources) - Old version
//////////////////////////////////////

// forge script script/DeploymentAllContracts.s.sol --broadcast --private-key <EDU_CHAIN_PRIVATE_KEY> \
//     ./contracts/zkv-attestation-contracts/interfaces/IZkVerifyAttestation.sol:ZkVerifyAttestation \
//     ./circuits/target/contract.sol:UltraVerifier \
//     ./contracts/circuits/HealthDataSharingVerifier.sol:HealthDataSharingVerifier \
//     ./contracts/HealthDataSharingRequester.sol:HealthDataSharingRequester \
//     ./contracts/HealthDataSharingExecutor.sol:HealthDataSharingExecutor \
//     ./contracts/rewards/RewardPoolFactory.sol:RewardPoolFactory \
//     ./contracts/rewards/RewardPool.sol:RewardPool \
//     ./contracts/rewards/MockRewardToken.sol:RewardToken --skip-simulation