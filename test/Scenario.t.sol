pragma solidity ^0.8.17;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import {Vm} from "forge-std/Vm.sol";


/// @dev - zkVerify Attestation Contracts
import { IZkVerifyAttestation } from "../contracts/zkv-attestation-contracts/interfaces/IZkVerifyAttestation.sol";

/// @dev - ZK (Ultraplonk) circuit, which is generated in Noir.
import { UltraVerifier } from "../circuits/target/contract.sol"; /// @dev - Deployed-Verifier SC, which was generated based on the main.nr
import { HealthDataSharingVerifier } from "../contracts/circuits/HealthDataSharingVerifier.sol";

import { HealthDataSharingRequester } from "../contracts/HealthDataSharingRequester.sol";
import { HealthDataSharingExecutor } from "../contracts/HealthDataSharingExecutor.sol";

import { RewardPoolFactory } from "../contracts/rewards/RewardPoolFactory.sol";
import { RewardPool } from "../contracts/rewards/RewardPool.sol";
import { MockRewardToken } from "../contracts/rewards/MockRewardToken.sol";

import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import { NoirHelper } from "foundry-noir-helper/NoirHelper.sol";


/***
 * @notice - The test of the scenario of HealthDataSharing
 **/
contract ScenarioTest is Test {
    using SafeERC20 for MockRewardToken;

    IZkVerifyAttestation public zkVerifyAttestation;

    UltraVerifier public verifier;
    HealthDataSharingVerifier public healthDataSharingVerifier;
    HealthDataSharingRequester public healthDataSharingRequester;
    HealthDataSharingExecutor public healthDataSharingExecutor;
    RewardPoolFactory public rewardPoolFactory;
    RewardPool public rewardPool;
    MockRewardToken public rewardToken;
    NoirHelper public noirHelper;

    /// @dev - Deployed-SC address on EDU Chain
    address _zkVerifyAttestation;

    /// @dev - Actors
    address medicalResearcher;
    address healthDataProvider;

    function setUp() public {
        rewardPoolFactory = new RewardPoolFactory();
        rewardToken = new MockRewardToken();

        /// @dev - Create new RwardPool contract
        uint256 rewardAmountPerSubmission = 5 * 1e18; /// @dev - 5 RewardToken
        rewardPool = rewardPoolFactory.createNewRewardPool(rewardToken, rewardAmountPerSubmission);

        zkVerifyAttestation = IZkVerifyAttestation(_zkVerifyAttestation); /// @dev - The ZkVerifyAttestation contract-deployed on EDU Chain
        verifier = new UltraVerifier();
        healthDataSharingVerifier = new HealthDataSharingVerifier(verifier);
        healthDataSharingRequester = new HealthDataSharingRequester(healthDataSharingVerifier);
        healthDataSharingExecutor = new HealthDataSharingExecutor(zkVerifyAttestation, healthDataSharingVerifier, healthDataSharingRequester, rewardPool);
        noirHelper = new NoirHelper();

        /// @dev - Set actors and charge the ETH balance of a medical researcher
        medicalResearcher = address(0x1);
        healthDataProvider = address(0x2);
        console.log("%s: %s", "medicalResearcher", medicalResearcher);
        console.logString("\n");
        console.log("%s: %s", "healthDataProvider", healthDataProvider);
        console.logString("\n");

        console.logString("Give the medical researcher 1 ETH");
        vm.deal(medicalResearcher, 1 ether);
        console.log("%s: %s", "medicalResearcher.balance", medicalResearcher.balance);
        rewardToken.mint(medicalResearcher, 100 ether);
        console.log("%s: %s", "rewardToken.balanceOf(medicalResearcher)", rewardToken.balanceOf(medicalResearcher));
        console.logString("\n");
    }

    /**
     * @notice - Test for the behavioir of each method
     * @dev - Examples with a ECDSA signature: https://book.getfoundry.sh/cheatcodes/sign?highlight=vm.stopPrank#examples
     */
    function testGeneralMethodsOfFoundry() public {
        // address user = vm.addr(userPrivateKey);
        // address signer = vm.addr(signerPrivateKey);
        // vm.startPrank(signer);

        address alice = address(0x1);
        address bob = address(0x2);
        console.log(alice);
        console.log(bob);

        console.logString("1/ Let's start testScenario");
        //vm.prank(alice);
        vm.startPrank(alice);
        console.log(msg.sender);

        // Give the user some ETH, just for good measure
        vm.deal(msg.sender, 1 ether);
        console.log(msg.sender.balance);
        vm.stopPrank();
        
        //vm.prank(bob);
        vm.startPrank(bob);
        console.log(msg.sender);
        vm.deal(msg.sender, 1 ether);
        console.log(msg.sender.balance);
        vm.stopPrank();

        console.logString("2/ The testScenario is finished");
    }

    /**
     * @notice - Entire scenario test (PoC)
     * @dev - [TODO]: Should check whether or not a medical researcher can properly see the HealthData-submitted.
     */
    function testScenario() public {
        vm.startPrank(medicalResearcher);
        console.log("%s: %s", "medicalResearcher-registered", medicalResearcher);

        // [TODO]
        console.logString("1/ A medical researcher would register");
        uint256 medicalResearcherId = healthDataSharingRequester.registerAsMedicalResearcher(medicalResearcher);
        //address medicalResearcherAccount = healthDataSharingRequester.getMedicalResearcherById(medicalResearcherId);
        //console.log("%s: %s", "medicalResearcherAccount", medicalResearcherAccount);
        console.logString("\n");

        console.logString("2/ A medical researcher would create a request of the health data");
        bytes memory medicalDataToBeRequested = abi.encodePacked("Medical Data to be requested"); /// [TODO]: Replace appropreate value.
        healthDataSharingRequester.createNewhealthDataSharingRequest(medicalResearcher, medicalDataToBeRequested);
        console.logString("\n");

        console.logString("3/ A medical researcher would create a reward pool and deposit the reward token into the reward pool");
        uint256 amount = 10 * 1e18;
        rewardToken.safeIncreaseAllowance(address(rewardPool), amount);
        rewardPool.depositRewardToken(amount);
        console.log("%s: %s", "medicalResearcher.balance", medicalResearcher.balance);
        console.log("%s: %s", "address(rewardPool).balance", address(rewardPool).balance);
        vm.stopPrank();
        console.logString("\n");

        console.logString("4/ Convert a Ultraplonk proof-generated via Noir's ZK circuit to a zkVerify version of proof + Submit the proof-converted to the zkVerify network and receive its attestation (attestation ID)");
        /// [TODO]:
        console.logString("\n");

        console.logString("5/ A health data provider would generate a zkProof of their health data");
        vm.startPrank(healthDataProvider);
        console.logString("\n");

        console.logString("6/ A health data provider would submit the generated-zkProof of their health data + The amount of the reward tokens would be destributed to the health data provider");
        console.logString("\n");
        
        console.logString("7/ Confirm that the health data provider could receive the appropreate amount of the reward tokens");        
        console.logString("\n");

        console.logString("8/ Confirm that the th medical researcher could collect the health data-requested (when the step 2/)");        
        console.logString("\n");
    }
   
}
