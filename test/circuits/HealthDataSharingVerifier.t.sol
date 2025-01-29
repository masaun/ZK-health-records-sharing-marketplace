pragma solidity ^0.8.17;

import "forge-std/Test.sol";
import { console2 } from "forge-std/console2.sol";
import { HealthDataSharingVerifier } from "../../contracts/circuits/HealthDataSharingVerifier.sol";
import { UltraVerifier } from "../../circuits/target/contract.sol"; /// @dev - Deployed-Verifier SC, which was generated based on the main.nr


contract HealthDataSharingVerifierTest is Test {
    HealthDataSharingVerifier public healthDataSharingVerifier;
    UltraVerifier public verifier;

    bytes32[] public dynamicCorrect = new bytes32[](3);
    bytes32[] public correct = new bytes32[](3);
    bytes32[] public wrong = new bytes32[](1);

    function setUp() public {
        verifier = new UltraVerifier();
        healthDataSharingVerifier = new HealthDataSharingVerifier(verifier);

        /// @dev - PublicInput/PublicReturnValue (i.e. If the return value of the main.nr is "pub", it should be define and store its public value here) of the main.nr        
        uint256 productId = 1;
        uint256 blood_pressure = 170;
        uint256 return_value = 1; /// @dev - Same with the "productId" 
        correct[0] = bytes32(uint256(productId));
        console.logBytes32(correct[0]);
        //correct[0] = bytes32(0x0000000000000000000000000000000000000000000000000000000000000001);  /// @dev - publicInput (productID = 1)
        correct[1] = bytes32(blood_pressure);
        console.logBytes32(correct[1]);
        //correct[1] = bytes32(blood_pressure);  /// @dev - publicInput (blood_pressure = 170)
        correct[2] = bytes32(uint256(return_value));
        console.logBytes32(correct[2]);
        //correct[2] = bytes32(0x0000000000000000000000000000000000000000000000000000000000000001);  /// @dev - publicReturnValue, which is the return value of the main.nr (productID = 1)

        /// @dev - PublicInput/PublicReturnValue <-- The following the publicInput is for testing the wrong case.
        wrong[0] = bytes32(0x0000000000000000000000000000000000000000000000000000000000000004);
    }

    function testVerifyProof() public view {
        bytes memory proof_w_inputs = vm.readFileBinary("./circuits/target/health_data_sharing.proof");
        bytes memory last = sliceAfter64Bytes(proof_w_inputs);
        //console2.logBytes(last);                    /// @dev - Check the log
        healthDataSharingVerifier.verifyHealthDataSharingProof(last, correct); /// @dev - Success (in PR #10)
    }

    function test_wrongProof() public {
        vm.expectRevert();
        bytes memory proof_w_inputs = vm.readFileBinary("./circuits/target/health_data_sharing.proof");
        bytes memory proof = sliceAfter64Bytes(proof_w_inputs);
        healthDataSharingVerifier.verifyHealthDataSharingProof(proof, wrong);
    }

    function test_dynamicProof() public {
        string[] memory _fieldNames = new string[](10);
        string[] memory _fieldValues = new string[](10);

        /// @dev - PublicInput of the main.nr
        _fieldNames[0] = "age";
        _fieldNames[1] = "average_hours_of_sleep";
        _fieldNames[2] = "blood_pressure";
        _fieldNames[3] = "blood_type";
        _fieldNames[4] = "heart_rate";
        _fieldNames[5] = "height";
        _fieldNames[6] = "name";
        _fieldNames[7] = "productId";
        _fieldNames[8] = "walletAddress";
        _fieldNames[9] = "weight";
        _fieldValues[0] = "19";
        _fieldValues[1] = "7";
        _fieldValues[2] = "120";
        _fieldValues[3] = "b";
        _fieldValues[4] = "80";
        _fieldValues[5] = "170";
        _fieldValues[6] = "Paul";
        _fieldValues[7] = "2";
        _fieldValues[8] = "0xA99D9550D807A9A2Ecb9e341b1eA3cA4d427c60A";
        _fieldValues[9] = "60";

        // Set expected dynamic proof outcome
        dynamicCorrect[0] = bytes32(0x0000000000000000000000000000000000000000000000000000000000000001);  /// @dev - publicInput (productID = 1)
        dynamicCorrect[1] = bytes32(0x0000000000000000000000000000000000000000000000000000000000000001);  /// @dev - publicReturnValue, which is the return value of the main.nr (productID = 1)
        bytes memory proofBytes = generateDynamicProof("test1", _fieldNames, _fieldValues);
        bytes memory proof = sliceAfter64Bytes(proofBytes);
        healthDataSharingVerifier.verifyHealthDataSharingProof(proof, dynamicCorrect); /// @dev - Success (in PR #11)
    }

    function test_dynamicProofSecondTest() public {
        string[] memory _fieldNames = new string[](10);
        string[] memory _fieldValues = new string[](10);

        /// @dev - PublicInput of the main.nr
        _fieldNames[0] = "age";
        _fieldNames[1] = "average_hours_of_sleep";
        _fieldNames[2] = "blood_pressure";
        _fieldNames[3] = "blood_type";
        _fieldNames[4] = "heart_rate";
        _fieldNames[5] = "height";
        _fieldNames[6] = "name";
        _fieldNames[7] = "productId";
        _fieldNames[8] = "walletAddress";
        _fieldNames[9] = "weight";
        _fieldValues[0] = "19";
        _fieldValues[1] = "7";
        _fieldValues[2] = "120";
        _fieldValues[3] = "b";
        _fieldValues[4] = "80";
        _fieldValues[5] = "170";
        _fieldValues[6] = "Paul";
        _fieldValues[7] = "2";
        _fieldValues[8] = "0xA99D9550D807A9A2Ecb9e341b1eA3cA4d427c60A";
        _fieldValues[9] = "60";

        // Set expected dynamic proof outcome
        dynamicCorrect[0] = bytes32(0x0000000000000000000000000000000000000000000000000000000000000001);  /// @dev - publicInput (productID = 1)
        dynamicCorrect[1] = bytes32(0x0000000000000000000000000000000000000000000000000000000000000001);  /// @dev - publicReturnValue, which is the return value of the main.nr (productID = 1)
        bytes memory proofBytes = generateDynamicProof("test2", _fieldNames, _fieldValues);
        bytes memory proof = sliceAfter64Bytes(proofBytes);
        healthDataSharingVerifier.verifyHealthDataSharingProof(proof, dynamicCorrect);
    }

    function test_dynamicProofThirdTest() public {
        string[] memory _fieldNames = new string[](10);
        string[] memory _fieldValues = new string[](10);

        /// @dev - PublicInput of the main.nr
        _fieldNames[0] = "age";
        _fieldNames[1] = "average_hours_of_sleep";
        _fieldNames[2] = "blood_pressure";
        _fieldNames[3] = "blood_type";
        _fieldNames[4] = "heart_rate";
        _fieldNames[5] = "height";
        _fieldNames[6] = "name";
        _fieldNames[7] = "productId";
        _fieldNames[8] = "walletAddress";
        _fieldNames[9] = "weight";
        _fieldValues[0] = "19";
        _fieldValues[1] = "7";
        _fieldValues[2] = "120";
        _fieldValues[3] = "b";
        _fieldValues[4] = "80";
        _fieldValues[5] = "170";
        _fieldValues[6] = "Paul";
        _fieldValues[7] = "2";
        _fieldValues[8] = "0xA99D9550D807A9A2Ecb9e341b1eA3cA4d427c60A";
        _fieldValues[9] = "60";

        // Set expected dynamic proof outcome
        dynamicCorrect[0] = bytes32(0x0000000000000000000000000000000000000000000000000000000000000001);  /// @dev - publicInput (productID = 1)
        dynamicCorrect[1] = bytes32(0x0000000000000000000000000000000000000000000000000000000000000001);  /// @dev - public value, which is the return value of the main.nr (productID = 1)
        bytes memory proofBytes = generateDynamicProof("test3", _fieldNames, _fieldValues);
        bytes memory proof = sliceAfter64Bytes(proofBytes);
        healthDataSharingVerifier.verifyHealthDataSharingProof(proof, dynamicCorrect);
    }


    /********************** 
     * Internal functions * 
     **********************/

    /// @dev This function generates dynamic proofs using 2 scripts in the /script directory
    ///
    /// @param _testName a random string to identify the test by, this is used to create a unique folder name in the /tmp directory
    /// @param _fields The field names within the Prover.toml file
    /// @param _fieldValues The field values associated with fields names within the Prover.toml file
    function generateDynamicProof(string memory _testName, string[] memory _fields, string[] memory _fieldValues)
        public
        returns (bytes memory)
    {
        require(_fields.length == _fieldValues.length, "generateProof: Input arrays not the same length");

        // Copy files and create Prover.toml in /tmp directory
        string[] memory filecreateCommand = new string[] (2);
        filecreateCommand[0] = "./script/createFile.sh";
        filecreateCommand[1] = _testName;
        bytes memory fileCreateResponse = vm.ffi(filecreateCommand);
        console.log(string(fileCreateResponse));

        string memory _file = string.concat("/tmp/", _testName, "/Prover.toml");
        vm.writeFile(_file, "");
        for (uint256 i; i < _fields.length; i++) {
            vm.writeLine(_file, string.concat(_fields[i], " = ", _fieldValues[i]));
        }

        // now generate the proof by calling the script using ffi
        string[] memory ffi_command = new string[] (2);
        ffi_command[0] = "./script/prove.sh";
        ffi_command[1] = _testName;
        bytes memory commandResponse = vm.ffi(ffi_command);
        console.log(string(commandResponse));
        //bytes memory _newProof = vm.readFileBinary(string.concat("/tmp/", _testName, "./circuits/target/health_data_sharing_proof"));
        bytes memory _newProof = vm.readFileBinary(string.concat("./circuits/target/health_data_sharing.proof"));
        return _newProof;
    }

    // Utility function, because the proof file includes the public inputs at the beginning
    function sliceAfter64Bytes(bytes memory data) internal pure returns (bytes memory) {
        uint256 length = data.length - 64;
        bytes memory result = new bytes(data.length - 64);
        for (uint i = 0; i < length; i++) {
            result[i] = data[i + 64];
        }
        return result;
    }
   
}
