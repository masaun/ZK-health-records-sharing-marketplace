pragma solidity ^0.8.17;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";


library DataTypes {

    /////////////////////////////////////////////////////////
    /// zkVerify and ZK circuit (in Noir) related sturcts ///
    /////////////////////////////////////////////////////////
    struct ProofAndPublicInput {
        bytes proof;
        bytes32[] publicInput;
    }

    /// @dev - Decode publicInput, which is stored in the (mapping) storage.
    struct HealthDataDecoded {
        uint64 productId;
        uint64 providerId;  // Using the "providerId" parameter - instead of the provider's "name" parameter. 
        uint32 name; // [NOTE]: Before an arg value is stored into here as u32, it would be converted from String ("John") -> Hash (bytes32) -> u32 (uint32)
        address walletAddress;
        uint8 height;
        uint8 weight;
        uint8 age;
        uint8 gender;        // 1: "Male", 2: "Female", 3: "Other"
        uint8 race_type;     // 1: "White", 2: "Black", 3: "Yello"
        uint8 blood_type;    // 1: "A", 2: "B", 3: "AB", 4: "O" 
        uint8 blood_pressure;
        uint8 heart_rate;
        uint8 average_hours_of_sleep;
        uint64 returnValueFromZkCircuit;
    }

    struct HealthDataDecodedReceived {
        HealthDataDecoded healthDataDecoded;
    }

    /////////////////////////////////////////
    /// Rewards (Payment) related sturcts ///
    /////////////////////////////////////////
    struct RewardDataInNativeToken {
        uint256 entranceFee;
        uint256 rewardAmountPerSubmission;
    }

    struct RewardDataInERC20 {
        IERC20 rewardToken;
        uint256 entranceFee;
        uint256 rewardAmountPerSubmission;
    }

    //enum InterestRateMode { NONE, STABLE, VARIABLE }
}