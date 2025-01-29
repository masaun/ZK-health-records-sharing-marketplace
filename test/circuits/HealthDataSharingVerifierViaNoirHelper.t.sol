pragma solidity ^0.8.17;

import { HealthDataSharingVerifier } from "../../contracts/circuits/HealthDataSharingVerifier.sol";
import { UltraVerifier } from "../../circuits/target/contract.sol"; /// @dev - Deployed-Verifier SC, which was generated based on the main.nr
import "forge-std/console.sol";

import "forge-std/Test.sol";
import { NoirHelper } from "foundry-noir-helper/NoirHelper.sol";

import { HashingWithKeccak256 } from "../../contracts/hashing/HashingWithKeccak256.sol";
import { HashingWithSha256 } from "../../contracts/hashing/HashingWithSha256.sol";


/***
 * @notice - The test of the HealthDataSharingVerifier.sol via the NoirHelper (foundry-noir-helper) module.
 ***/
contract HealthDataSharingVerifierViaNoirHelperTest is Test {
    NoirHelper public noirHelper;
    HealthDataSharingVerifier public healthDataSharingVerifier;
    UltraVerifier public verifier;
    HashingWithKeccak256 public hashingWithKeccak256;
    HashingWithSha256 public hashingWithSha256;

    function setUp() public {
        noirHelper = new NoirHelper();
        verifier = new UltraVerifier();
        healthDataSharingVerifier = new HealthDataSharingVerifier(verifier);
        hashingWithKeccak256 = new HashingWithKeccak256();
        hashingWithSha256 = new HashingWithSha256();
    }

    function testVerifyProof_via_NoirHelper() public {
        /// @dev - Just retrieve log when the data type of each blood_type is converted from "String" to "Bytes".
        // bytes memory _blood_type_a_bytes = abi.encodePacked("a");
        // bytes memory _blood_type_b_bytes = abi.encodePacked("b");
        // bytes memory _blood_type_ab_bytes = abi.encodePacked("ab");
        // bytes memory _blood_type_o_bytes = abi.encodePacked("o");
        // console.logBytes(_blood_type_a_bytes);  /// @dev - [Log]: 0x61
        // console.logBytes(_blood_type_b_bytes);  /// @dev - [Log]: 0x62
        // console.logBytes(_blood_type_ab_bytes); /// @dev - [Log]: 0x6162
        // console.logBytes(_blood_type_o_bytes);  /// @dev - [Log]: 0x6f

        /// @notice - Commentout the variable, which each arguments are stored. Because it will cause the YUI error of "too deep in the stack by 2 slots".
        // uint64 productId = 1;
        // uint64 providerId = 1;
        // uint32 name = 3763487194; // "John" -> Bytes (by abi.encodePacked()) -> Uint32 (by uint32(bytes))
        // //string memory _name = "John";
        // address walletAddress = 0x2e315a7650eD5FaF4F909EdaF6a8C5908c568F04;
        // uint8 height = 180;
        // uint8 weight = 70;
        // uint8 age = 21;
        // uint8 gender = 1;        // 1: "Male", 2: "Female", 3: "Other"
        // uint8 race_type = 1;     // 1: "White", 2: "Black", 3: "Yello"
        // uint8 blood_type = 1;    // 1: "A", 2: "B", 3: "AB", 4: "O" 
        // uint8 blood_pressure = 110;
        // uint8 heart_rate = 75;
        // uint8 average_hours_of_sleep = 8;
        // bool revealProviderId = true;
        // bool revealName = false;
        // bool revealWalletAddress = true;
        // bool revealAge = true; // @dev - Boolean type is "1" or "2" in the Prover.toml
        // bool revealGender = true;
        // bool revealHeight = true;
        // bool revealWeight = true;
        // bool revealRaceType = true;
        // bool revealBloodType = true;
        // bool revealBloodPressure = true;
        // bool revealHeartRate = true;
        // bool revealAverageHoursOfSleep = true;

        noirHelper.withInput("productId", 1)
                  .withInput("providerId", 1)
                  .withInput("name", 376348719)
                  .withInput("walletAddress", 0x2e315a7650eD5FaF4F909EdaF6a8C5908c568F04) /// @dev - Success
                  //.withInput("walletAddress", bytes32(abi.encodePacked(0x8b29290F07E37615Fa68D64A1759F19d72D154E9))) /// @dev - Convert to 'bytes' type data
                  .withInput("height", 180)
                  .withInput("weight", 70)
                  .withInput("age",21)
                  .withInput("gender", 1)
                  .withInput("race_type", 1)
                  .withInput("blood_type", 1) /// @dev - 'blood_type' parameter (u8) - 'A' is '1', 'B' is '2', 'AB' is '3', 'O' is '4'
                  .withInput("blood_pressure", 110)
                  .withInput("heart_rate", 75)
                  .withInput("average_hours_of_sleep", 8)
                  .withInput("revealProviderId", true)
                  .withInput("revealName", false)
                  .withInput("revealWalletAddress", true)
                  .withInput("revealAge", true)
                  .withInput("revealGender", true)
                  .withInput("revealHeight", true)
                  .withInput("revealWeight", true)
                  .withInput("revealRaceType", true)
                  .withInput("revealBloodType", true)
                  .withInput("revealBloodPressure", true)
                  .withInput("revealHeartRate", true)
                  .withInput("revealAverageHoursOfSleep", true);
                  //.withInput("return", 1);
                  //.withStructInput("return", [1, 1, 0, 0x2e315a7650eD5FaF4F909EdaF6a8C5908c568F04, 180, 70, 21, 1, 1, 1, 110, 75, 8]);

                //   RevealedData {
                //     productId: outputProductId,
                //     providerId: outputProviderId,
                //     name: outputName,
                //     walletAddress: outputWalletAddress,
                //     height: outputHeight,
                //     weight: outputWeight,
                //     age: outputAge,
                //     gender: outputGender,
                //     race_type: outputRaceType,
                //     blood_type: outputBloodType,
                //     blood_pressure: outputBloodPressure,
                //     heart_rate: outputHeartRate,
                //     average_hours_of_sleep: outputAverageHoursOfSleep
                // }

        (bytes32[] memory publicInputs, bytes memory proof) = noirHelper.generateProof("test_verifyProof", 14); /// [NOTE]: The number of 'publicInput' is '2'
        //(bytes32[] memory publicInputs, bytes memory proof) = noirHelper.generateProof("test_verifyProof", 2); /// [NOTE]: The number of 'publicInput' is '2'
        healthDataSharingVerifier.verifyHealthDataSharingProof(proof, publicInputs);
    }






    // function testVerifyProof() public view {
    //     bytes memory proof_w_inputs = vm.readFileBinary("./circuits/target/health_data_sharing.proof");
    //     bytes memory last = sliceAfter64Bytes(proof_w_inputs);
    //     //console2.logBytes(last);                    /// @dev - Check the log
    //     healthDataSharingVerifier.verifyHealthDataSharingProof(last, correct); /// @dev - Success (in PR #10)
    // }

    // function test_wrongProof() public {
    //     vm.expectRevert();
    //     bytes memory proof_w_inputs = vm.readFileBinary("./circuits/target/health_data_sharing.proof");
    //     bytes memory proof = sliceAfter64Bytes(proof_w_inputs);
    //     healthDataSharingVerifier.verifyHealthDataSharingProof(proof, wrong);
    // }

    // function test_dynamicProof() public {
    //     string[] memory _fieldNames = new string[](10);
    //     string[] memory _fieldValues = new string[](10);

    //     /// @dev - PublicInput of the main.nr
    //     _fieldNames[0] = "age";
    //     _fieldNames[1] = "average_hours_of_sleep";
    //     _fieldNames[2] = "blood_pressure";
    //     _fieldNames[3] = "blood_type";
    //     _fieldNames[4] = "heart_rate";
    //     _fieldNames[5] = "height";
    //     _fieldNames[6] = "name";
    //     _fieldNames[7] = "productId";
    //     _fieldNames[8] = "walletAddress";
    //     _fieldNames[9] = "weight";
    //     _fieldValues[0] = "19";
    //     _fieldValues[1] = "7";
    //     _fieldValues[2] = "120";
    //     _fieldValues[3] = "b";
    //     _fieldValues[4] = "80";
    //     _fieldValues[5] = "170";
    //     _fieldValues[6] = "Paul";
    //     _fieldValues[7] = "2";
    //     _fieldValues[8] = "0xA99D9550D807A9A2Ecb9e341b1eA3cA4d427c60A";
    //     _fieldValues[9] = "60";

    //     // Set expected dynamic proof outcome
    //     dynamicCorrect[0] = bytes32(0x0000000000000000000000000000000000000000000000000000000000000001);  /// @dev - publicInput (productID = 1)
    //     dynamicCorrect[1] = bytes32(0x0000000000000000000000000000000000000000000000000000000000000001);  /// @dev - publicReturnValue, which is the return value of the main.nr (productID = 1)
    //     bytes memory proofBytes = generateDynamicProof("test1", _fieldNames, _fieldValues);
    //     bytes memory proof = sliceAfter64Bytes(proofBytes);
    //     healthDataSharingVerifier.verifyHealthDataSharingProof(proof, dynamicCorrect); /// @dev - Success (in PR #11)
    // }

    // function test_dynamicProofSecondTest() public {
    //     string[] memory _fieldNames = new string[](10);
    //     string[] memory _fieldValues = new string[](10);

    //     /// @dev - PublicInput of the main.nr
    //     _fieldNames[0] = "age";
    //     _fieldNames[1] = "average_hours_of_sleep";
    //     _fieldNames[2] = "blood_pressure";
    //     _fieldNames[3] = "blood_type";
    //     _fieldNames[4] = "heart_rate";
    //     _fieldNames[5] = "height";
    //     _fieldNames[6] = "name";
    //     _fieldNames[7] = "productId";
    //     _fieldNames[8] = "walletAddress";
    //     _fieldNames[9] = "weight";
    //     _fieldValues[0] = "19";
    //     _fieldValues[1] = "7";
    //     _fieldValues[2] = "120";
    //     _fieldValues[3] = "b";
    //     _fieldValues[4] = "80";
    //     _fieldValues[5] = "170";
    //     _fieldValues[6] = "Paul";
    //     _fieldValues[7] = "2";
    //     _fieldValues[8] = "0xA99D9550D807A9A2Ecb9e341b1eA3cA4d427c60A";
    //     _fieldValues[9] = "60";

    //     // Set expected dynamic proof outcome
    //     dynamicCorrect[0] = bytes32(0x0000000000000000000000000000000000000000000000000000000000000001);  /// @dev - publicInput (productID = 1)
    //     dynamicCorrect[1] = bytes32(0x0000000000000000000000000000000000000000000000000000000000000001);  /// @dev - publicReturnValue, which is the return value of the main.nr (productID = 1)
    //     bytes memory proofBytes = generateDynamicProof("test2", _fieldNames, _fieldValues);
    //     bytes memory proof = sliceAfter64Bytes(proofBytes);
    //     healthDataSharingVerifier.verifyHealthDataSharingProof(proof, dynamicCorrect);
    // }

    // function test_dynamicProofThirdTest() public {
    //     string[] memory _fieldNames = new string[](10);
    //     string[] memory _fieldValues = new string[](10);

    //     /// @dev - PublicInput of the main.nr
    //     _fieldNames[0] = "age";
    //     _fieldNames[1] = "average_hours_of_sleep";
    //     _fieldNames[2] = "blood_pressure";
    //     _fieldNames[3] = "blood_type";
    //     _fieldNames[4] = "heart_rate";
    //     _fieldNames[5] = "height";
    //     _fieldNames[6] = "name";
    //     _fieldNames[7] = "productId";
    //     _fieldNames[8] = "walletAddress";
    //     _fieldNames[9] = "weight";
    //     _fieldValues[0] = "19";
    //     _fieldValues[1] = "7";
    //     _fieldValues[2] = "120";
    //     _fieldValues[3] = "b";
    //     _fieldValues[4] = "80";
    //     _fieldValues[5] = "170";
    //     _fieldValues[6] = "Paul";
    //     _fieldValues[7] = "2";
    //     _fieldValues[8] = "0xA99D9550D807A9A2Ecb9e341b1eA3cA4d427c60A";
    //     _fieldValues[9] = "60";

    //     // Set expected dynamic proof outcome
    //     dynamicCorrect[0] = bytes32(0x0000000000000000000000000000000000000000000000000000000000000001);  /// @dev - publicInput (productID = 1)
    //     dynamicCorrect[1] = bytes32(0x0000000000000000000000000000000000000000000000000000000000000001);  /// @dev - public value, which is the return value of the main.nr (productID = 1)
    //     bytes memory proofBytes = generateDynamicProof("test3", _fieldNames, _fieldValues);
    //     bytes memory proof = sliceAfter64Bytes(proofBytes);
    //     healthDataSharingVerifier.verifyHealthDataSharingProof(proof, dynamicCorrect);
    // }


    // /********************** 
    //  * Internal functions * 
    //  **********************/

    // /// @dev This function generates dynamic proofs using 2 scripts in the /script directory
    // ///
    // /// @param _testName a random string to identify the test by, this is used to create a unique folder name in the /tmp directory
    // /// @param _fields The field names within the Prover.toml file
    // /// @param _fieldValues The field values associated with fields names within the Prover.toml file
    // function generateDynamicProof(string memory _testName, string[] memory _fields, string[] memory _fieldValues)
    //     public
    //     returns (bytes memory)
    // {
    //     require(_fields.length == _fieldValues.length, "generateProof: Input arrays not the same length");

    //     // Copy files and create Prover.toml in /tmp directory
    //     string[] memory filecreateCommand = new string[] (2);
    //     filecreateCommand[0] = "./script/createFile.sh";
    //     filecreateCommand[1] = _testName;
    //     bytes memory fileCreateResponse = vm.ffi(filecreateCommand);
    //     console.log(string(fileCreateResponse));

    //     string memory _file = string.concat("/tmp/", _testName, "/Prover.toml");
    //     vm.writeFile(_file, "");
    //     for (uint256 i; i < _fields.length; i++) {
    //         vm.writeLine(_file, string.concat(_fields[i], " = ", _fieldValues[i]));
    //     }

    //     // now generate the proof by calling the script using ffi
    //     string[] memory ffi_command = new string[] (2);
    //     ffi_command[0] = "./script/prove.sh";
    //     ffi_command[1] = _testName;
    //     bytes memory commandResponse = vm.ffi(ffi_command);
    //     console.log(string(commandResponse));
    //     //bytes memory _newProof = vm.readFileBinary(string.concat("/tmp/", _testName, "./circuits/target/health_data_sharing_proof"));
    //     bytes memory _newProof = vm.readFileBinary(string.concat("./circuits/target/health_data_sharing.proof"));
    //     return _newProof;
    // }

    // // Utility function, because the proof file includes the public inputs at the beginning
    // function sliceAfter64Bytes(bytes memory data) internal pure returns (bytes memory) {
    //     uint256 length = data.length - 64;
    //     bytes memory result = new bytes(data.length - 64);
    //     for (uint i = 0; i < length; i++) {
    //         result[i] = data[i + 64];
    //     }
    //     return result;
    // }
   
}
