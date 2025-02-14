/***
 * @notice - Revealed Data to "Selective Disclosure" in ZK circuit
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
    blood_pressure_systolic: u8,
    blood_pressure_diastolic: u8,
    heart_rate: u8,
    average_hours_of_sleep: u8
}

/***
 * @notice - Assume that this ZK circuit is run by a health data provider
 **/
fn main(
    name: u32, // [NOTE]: Before an arg value is stored into here as u32, it would be converted from String ("John") -> Hash (bytes32) -> u32 (uint32)
    walletAddress: Field,
    height: u8,
    weight: u8,
    age: u8,
    gender: u8,        // 1: "Male", 2: "Female", 3: "Other"
    race_type: u8,     // 1: "White", 2: "Black", 3: "Yello"
    blood_type: u8,    // 1: "A", 2: "B", 3: "AB", 4: "O" 
    blood_pressure_systolic: u8,
    blood_pressure_diastolic: u8,
    heart_rate: u8,
    average_hours_of_sleep: u8,
    revealName: bool,
    revealWalletAddress: bool,
    revealAge: bool, // @dev - Boolean type is "0": False /or True: "1" in the Prover.toml
    revealGender: bool,
    revealHeight: bool,
    revealWeight: bool,
    revealRaceType: bool,
    revealBloodType: bool,
    revealBloodPressureSystolic: bool,
    revealBloodPressureDiastolic: bool,
    revealHeartRate: bool,
    revealAverageHoursOfSleep: bool
) -> pub RevealedData {
    // @dev - "Selective Disclosure". A health data provider can choose which data should be revealed.
    let outputName = if revealName { name } else { 0 };
    let outputWalletAddress = if revealWalletAddress { walletAddress } else { 0 };
    let outputHeight = if revealHeight { height } else { 0 };
    let outputWeight = if revealWeight { weight } else { 0 };
    let outputAge = if revealAge { age } else { 0 };
    let outputGender = if revealGender { gender } else { 0 };
    let outputRaceType = if revealRaceType { race_type } else { 0 };
    let outputBloodType = if revealBloodType { blood_type } else { 0 };
    let outputBloodPressureSystolic = if revealBloodPressureSystolic { blood_pressure_systolic } else { 0 };
    let outputBloodPressureDiastolic = if revealBloodPressureDiastolic { blood_pressure_diastolic } else { 0 };
    let outputHeartRate = if revealHeartRate { heart_rate } else { 0 };
    let outputAverageHoursOfSleep = if revealAverageHoursOfSleep { average_hours_of_sleep } else { 0 };

    // @dev - Validate a given "age" is over 18.
    assert(age >= 18);
    if (revealAge) {
        assert(outputAge >= 18);
    }

    // @dev - Validate a given "blood_type" is 1, 2, 3, or 4
    let mut blood_type_flag: bool = false;
    if (outputBloodType == 1) | (outputBloodType == 2) | (outputBloodType == 3) | (outputBloodType == 4) {
    //if (blood_type == 1) | (blood_type == 2) | (blood_type == 3) | (blood_type == 4) {
        blood_type_flag = true;
    }
    assert(blood_type_flag == true);

    // @dev - Validate a given "walletAddress" is correct size
    outputWalletAddress.assert_max_bit_size::<160>();

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
        blood_pressure_systolic: outputBloodPressureSystolic,
        blood_pressure_diastolic: outputBloodPressureDiastolic,
        heart_rate: outputHeartRate,
        average_hours_of_sleep: outputAverageHoursOfSleep
    }
}


#[test]
fn test_main() { // [CLI]: nargo test --show-output
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
    let blood_pressure_systolic: u8 = 120;
    let blood_pressure_diastolic: u8 = 80;
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
    let revealBloodPressureSystolic: bool = true;
    let revealBloodPressureDiastolic: bool = true;
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
        blood_pressure_systolic,
        blood_pressure_diastolic, 
        heart_rate, 
        average_hours_of_sleep,
        revealName,
        revealWalletAddress,
        revealAge,
        revealGender,
        revealHeight,
        revealWeight,
        revealRaceType,
        revealBloodType,
        revealBloodPressureSystolic,
        revealBloodPressureDiastolic,
        revealHeartRate,
        revealAverageHoursOfSleep
    );

    // @dev - For when the return value is "RevealedData (struct data)"  - Validate the return value
    assert(revealed_data.name == 0, "Name should not be revealed (0)");
    assert(revealed_data.walletAddress == 0x2e315a7650eD5FaF4F909EdaF6a8C5908c568F04, "walletAddress should be 0x2e315a7650eD5FaF4F909EdaF6a8C5908c568F04");
    assert(revealed_data.height == 180, "Height should be 180 cm");
    assert(revealed_data.weight == 70, "Height should be 70 kg");
    assert(revealed_data.age == 21, "Age should be 21");
    assert(revealed_data.gender == 1, "Gender should Male (1)");
    assert(revealed_data.race_type == 1, "Race Type should 'White' (1)");
    assert(revealed_data.blood_type == 1, "Blood Type should 'A' (1)");
    assert(revealed_data.blood_pressure_systolic == 120, "Blood Pressure/Systolic should 120 mmHg");
    assert(revealed_data.blood_pressure_diastolic == 80, "Blood Pressure/Diastolic should 80 mmHg");
    assert(revealed_data.heart_rate == 75, "Heart Rate should be 75/h");
    assert(revealed_data.average_hours_of_sleep == 8, "Average hours of sleep should be 8 hours");
    println(revealed_data.name);
    println(revealed_data.walletAddress);
    println(revealed_data.height);
    println(revealed_data.weight);
    println(revealed_data.age);
    println(revealed_data.gender);
    println(revealed_data.race_type);
    println(revealed_data.blood_type);
    println(revealed_data.blood_pressure_systolic);
    println(revealed_data.blood_pressure_diastolic);
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
