// Hash methods: https://noir-lang.org/docs/noir/standard_library/cryptographic_primitives/hashes
use dep::std::hash::pedersen_hash; // Enable to use the pedersen_hash() function
use dep::std::hash::keccak256;     // Enable to use the keccak() function
use dep::std::hash::sha256;        // Enable to use the sha() function
use dep::std::hash::blake2s;       // Enable to use the blake2s() function
use dep::std::hash::hash_to_field; // Enable to use the hash_to_field() function

use dep::std::convert::From::from;        // https://noir-lang.org/docs/noir/standard_library/traits#stdconvertfrom
use dep::std::convert::Into::into;       // https://noir-lang.org/docs/noir/standard_library/traits#stdconvertinto


/***
 * @notice - Revealed Data
 **/
pub struct RevealedData {
    name: u32, // [NOTE]: Before an arg value is stored into here as u32, it would be converted from String ("John") -> Hash (bytes32) -> u32 (uint32)
    walletAddress: Field,
    height: u8,
    weight: u8,
    age: u8,
    gender: u8,        // 1: "Male", 2: "Female", 3: "Other"
    race_type: u8,     // 1: "White", 2: "Black", 3: "Yello"
    blood_type: u8,    // 1: "A", 2: "B", 3: "AB", 4: "O" 
    blood_pressure: u8,
    heart_rate: u8,
    average_hours_of_sleep: u8
}


/***
 * @notice - Assume that this ZK circuit is run by both a Medical Researcher's request and a provider's request
 * @notice - However, the Verifier contract will be deployed based on the zkProof-generated for a Medical Researcher's request
 * @notice - a Medical Researcher can choose which parameter (input) should be "public" and which constraint(s) is included.
 * @dev - "providerId" parameter (u64) - This is used instead of "name" parameter (str<>)
 * @dev - "blood_type" parameter (u8) - "A" is "1", "B" is "2", "AB" is "3", "O" is "4"
 * @dev - [TODO]: "productId" parameter - This may be better to replace with the "medical_researcher_id"
 **/
fn main(  // [TODO]: Move the following parameters into the convert_health_data_to_hash() - To use the "dynamic" size of array ([u32; N]) and convert HealthData to "Hash" type of data. After that, the converted-"Hash" type of HealthData should be stored into here. (In this case, only 1 Field type of parameter is needed in the main() function here)
    name: u32, // [NOTE]: Before an arg value is stored into here as u32, it would be converted from String ("John") -> Hash (bytes32) -> u32 (uint32)
    walletAddress: Field,
    height: u8,
    weight: u8,
    age: u8,
    gender: u8,        // 1: "Male", 2: "Female", 3: "Other"
    race_type: u8,     // 1: "White", 2: "Black", 3: "Yello"
    blood_type: u8,    // 1: "A", 2: "B", 3: "AB", 4: "O" 
    blood_pressure: u8,
    heart_rate: u8,
    average_hours_of_sleep: u8,
    revealProviderId: bool,
    revealName: bool,
    revealWalletAddress: bool,
    revealAge: bool, // @dev - Boolean type is "0": False /or True: "1" in the Prover.toml
    revealGender: bool,
    revealHeight: bool,
    revealWeight: bool,
    revealRaceType: bool,
    revealBloodType: bool,
    revealBloodPressure: bool,
    revealHeartRate: bool,
    revealAverageHoursOfSleep: bool
) -> pub RevealedData {
    // Extracting data from the Helper
    // 46829 Gates
    //let healthData = extractor();

    // @dev - Selective Disclosure
    let outputName = if revealName { name } else { 0 };
    let outputWalletAddress = if revealWalletAddress { walletAddress } else { 0 };
    let outputHeight = if revealHeight { height } else { 0 };
    let outputWeight = if revealWeight { weight } else { 0 };
    let outputAge = if revealAge { age } else { 0 };
    let outputGender = if revealGender { gender } else { 0 };
    let outputRaceType = if revealRaceType { race_type } else { 0 };
    let outputBloodType = if revealBloodType { blood_type } else { 0 };
    let outputBloodPressure = if revealBloodPressure { blood_pressure } else { 0 };
    let outputHeartRate = if revealHeartRate { heart_rate } else { 0 };
    let outputAverageHoursOfSleep = if revealAverageHoursOfSleep { average_hours_of_sleep } else { 0 };

    // @dev - [TODO]: Dynamic number of elements for Array type of Integer like this:
    // location_data: Field,   // i.e. "New York" -> Field type -> Slice it + Measure length of it -> Array Field type ([u8; N])

    // @dev - Validate a given "age" is over 18.
    assert(age >= 18);

    // @dev - a Medical Researcher can choose which constraint(s) is included.
    if (revealAge) {
        assert(outputAge >= 18);
    }

    let mut blood_type_flag: bool = false;
    if (outputBloodType == 1) | (outputBloodType == 2) | (outputBloodType == 3) | (outputBloodType == 4) {
    //if (blood_type == 1) | (blood_type == 2) | (blood_type == 3) | (blood_type == 4) {
        blood_type_flag = true;
    }
    assert(blood_type_flag == true);

    assert(outputHeight >= 150);
    //assert(height >= 150);
    assert(outputWeight >= 40);
    //assert(weight >= 40);

    outputWalletAddress.assert_max_bit_size::<160>();
    //walletAddress.assert_max_bit_size::<160>();
    //walletAddress.assert_max_bit_size(160);

    // @dev - Return data as a "RevealedData" struct data
    RevealedData {
        name: outputName,
        walletAddress: outputWalletAddress,
        height: outputHeight,
        weight: outputWeight,
        age: outputAge,
        gender: outputGender,
        race_type: outputRaceType,
        blood_type: outputBloodType,
        blood_pressure: outputBloodPressure,
        heart_rate: outputHeartRate,
        average_hours_of_sleep: outputAverageHoursOfSleep
    }
}


#[test]
fn test_main() { // nargo test --show-output

    // @dev - Convert String to Hex in Rust's way
    //let hex_string = hex::encode("Hello world!"); // Reference from "Rust" documentation
    //println(hex_string);    

    // @dev - std::convert::From::from
    //let result: bool = true;
    //println(from<bool>(result)); 

    let mut true_flag: [u8; 1] = [1];
    let mut false_flag: [u8; 1] = [2];
    let mut true_flag_2: [u8; 1] = "1".as_bytes();
    let mut false_flag_2: [u8; 1] = "2".as_bytes();
    println(true_flag_2);  // [49]
    println(false_flag_2); // [50]    

    let _name: str<4> = "John";
    let _name_bytes: [u8; 4] = _name.as_bytes();  // [74, 111, 104, 110]
    println(_name);                    
    println(_name_bytes.as_str_unchecked());     // John
    println(_name_bytes.as_slice());             // &[74, 111, 104, 110]

    let _b: [u8; 1] = "b".as_bytes();
    println(_b);
    println(_b.as_str_unchecked());

    println("a".as_bytes());     // [97]
    println("a".as_bytes()[0]);  // 97
    println(15);                 // 0x0f

    /***
     * @notice - The actual args for being stored into the parameters
     **/
    let name: u32 = 3763487194; // uint32, which is converted from Bytes32 - SHA256 hash (from "John")
    //let name_hash: u32 = 0xa8cfcd74832004951b4408cdb0a5dbcd8c7e52d43f7fe244bf720582e05241da; // Bytes32 - SHA256 hash (from "John") - But, an error of "too large"
    let walletAddress: Field = 0x2e315a7650eD5FaF4F909EdaF6a8C5908c568F04;
    let height: u8 = 180;
    let weight: u8 = 70;
    let age: u8 = 21;
    let gender: u8 = 1;        // 1: "Male", 2: "Female", 3: "Other"
    let race_type: u8 = 1;     // 1: "White", 2: "Black", 3: "Yello"
    let blood_type: u8 = 1;    // 1: "A", 2: "B", 3: "AB", 4: "O" 
    //let blood_type: [u8; 1],    // 1: "A", 2: "B", 3: "AB", 4: "O" 
    let blood_pressure: u8 = 110;
    let heart_rate: u8 = 75;
    let average_hours_of_sleep: u8 = 8;
    let revealProviderId: bool = true;
    let revealName: bool = false;
    let revealWalletAddress: bool = true;
    let revealAge: bool = true; // @dev - Boolean type is "1" or "2" in the Prover.toml
    let revealGender: bool = true;
    let revealHeight: bool = true;
    let revealWeight: bool = true;
    let revealRaceType: bool = true;
    let revealBloodType: bool = true;
    let revealBloodPressure: bool = true;
    let revealHeartRate: bool = true;
    let revealAverageHoursOfSleep: bool = true;

    let revealed_data = main(
        name, 
        walletAddress, 
        height, 
        weight, 
        age, 
        gender,
        race_type,
        blood_type, 
        blood_pressure, 
        heart_rate, 
        average_hours_of_sleep,
        revealProviderId,
        revealName,
        revealWalletAddress,
        revealAge,
        revealGender,
        revealHeight,
        revealWeight,
        revealRaceType,
        revealBloodType,
        revealBloodPressure,
        revealHeartRate,
        revealAverageHoursOfSleep
    );

    // @dev - For when the return value is "RevealedData (struct data)"  - Validate the return value
    assert(revealed_data.name == 0, "Name should not be revealed (0)");
    assert(revealed_data.walletAddress == 0x2e315a7650eD5FaF4F909EdaF6a8C5908c568F04, "walletAddress should be 0x2e315a7650eD5FaF4F909EdaF6a8C5908c568F04");
    assert(revealed_data.height == 180, "Height should be 180");
    assert(revealed_data.weight == 70, "Height should be 70");
    assert(revealed_data.age == 21, "Age should be 21");
    assert(revealed_data.gender == 1, "Gender should Male (1)");
    assert(revealed_data.race_type == 1, "Race Type should 'White' (1)");
    assert(revealed_data.blood_type == 1, "Blood Type should 'A' (1)");
    assert(revealed_data.blood_pressure == 110, "Blood Pressure should 110");
    assert(revealed_data.heart_rate == 75, "Heart Rate should be 75");
    assert(revealed_data.average_hours_of_sleep == 8, "Average hours of sleep should be 8 hours");
    println(revealed_data.name);
    println(revealed_data.walletAddress);
    println(revealed_data.height);
    println(revealed_data.weight);
    println(revealed_data.age);
    println(revealed_data.gender);
    println(revealed_data.race_type);
    println(revealed_data.blood_type);
    println(revealed_data.blood_pressure);
    println(revealed_data.heart_rate);
    println(revealed_data.average_hours_of_sleep);

    // @dev - For when the return value is "productId (u64)"  - Validate the return value
    // assert(
    //     main(
    //         name, 
    //         walletAddress, 
    //         height, 
    //         weight, 
    //         age, 
    //         gender,
    //         race_type,
    //         blood_type, 
    //         blood_pressure, 
    //         heart_rate, 
    //         average_hours_of_sleep,
    //         revealProviderId,
    //         revealName,
    //         revealWalletAddress,
    //         revealAge,
    //         revealGender,
    //         revealHeight,
    //         revealWeight,
    //         revealRaceType,
    //         revealBloodType,
    //         revealBloodPressure,
    //         revealHeartRate,
    //         revealAverageHoursOfSleep
    //     ) == 1
    // );
}
