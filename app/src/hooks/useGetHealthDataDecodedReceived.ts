import { useState, useEffect, useRef } from 'react';
import { useAccount } from '@/context/AccountContext';

import { ethers, providers, Contract } from 'ethers';


export function useGetHealthDataDecodedReceived() {
    const [healthDataDecodedReceived, setHealthDataDecodedReceived] = useState<any>(null);
    const [publicInputInHealthDataReceived, setPublicInputInHealthDataReceived] = useState<any>(null);
    const [name, setName] = useState<any>(null);
    const [walletAddress, setWalletAddress] = useState<any>(null);
    const [height, setHeight] = useState<any>(null);
    const [weight, setWeight] = useState<any>(null);
    const [age, setAge] = useState<any>(null);
    const [gender, setGender] = useState<any>(null);
    const [raceType, setRaceType] = useState<any>(null);
    const [bloodType, setBloodType] = useState<any>(null);
    const [bloodPressureSystolic, setBloodPressureSystolic] = useState<any>(null);
    const [bloodPressureDiastolic, setBloodPressureDiastolic] = useState<any>(null);
    const [heartRate, setHeartRate] = useState<any>(null);
    const [averageHoursOfSleep, setAverageHoursOfSleep] = useState<any>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const onGetHealthDataDecodedReceived = async (
        provider: any, /// Browser Provider, which is retrieved via ethers.js v6
        signer: any,   /// Browser Signer, which is retrieved via ethers.js v6
        account: any,        /// This is also used as a "walletAddress" 
        attestationId: string
    ): Promise<void> => {
        try {
            console.log(`provider: ${JSON.stringify(provider, null, 4)}`);
            console.log(`signer: ${JSON.stringify(signer, null, 4)}`);
            console.log(`account: ${account}`);
            console.log(`attestationId (in the onGetHealthDataDecodedReceived()): ${attestationId}`);

            setStatus('verifying');
            setError(null);

            /// @dev - ABI of the HealthDataSharingExecutor.sol
            const abiHealthDataSharingExecutorContract = [
                "function submitHealthData(bytes calldata proof, bytes32[] calldata publicInput, uint256 _attestationId, bytes32 _leaf, bytes32[] calldata _merklePath, uint256 _leafCount, uint256 _index)",
                "function receiveHealthData(uint256 _attestationId)",
                "function getAvailableAttestationIds() public view returns(uint256[] memory _availableAttestationIds)",
                "function getHealthDataProviderByAttestationId(uint256 _attestationId) public view returns(address _healthDataProvider)",
                "function getHealthDataDecodedReceived(uint256 _attestationId) public view returns (tuple(uint256 id, string data))",
                "function getHealthData(uint256 _attestationId) public view returns(tuple(bytes proof, bytes32[] publicInput))",
                "function getPublicInputInHealthData(uint256 attestationId, address healthDataProvider, address medicalResearcher) public view returns(bytes32[] memory _publicInput)",
                //"function getPublicInputInHealthData(uint256 _attestationId) public view returns(bytes32[] memory _publicInput)",
                "function getPaymentStatus(uint256 attestationId, address healthDataProvider, address medicalResearcher) public view returns(bool _paid)",
                "function getRewardAmountPerSubmission() public view returns(uint256 _rewardAmountPerSubmission)",
                "function bytes32ToUint256(bytes32 data) public pure returns (uint256)"
            ];

            const healthDataSharingExecutorContract = new Contract(process.env.NEXT_PUBLIC_EDU_CHAIN_HEALTH_DATA_SHARING_EXECUTOR_CONTRACT_ADDRESS, abiHealthDataSharingExecutorContract, provider);
            const healthDataSharingExecutorContractWithSigner = healthDataSharingExecutorContract.connect(signer);

            /// @dev - Retrieve the logs of above.
            const healthDataProvider = await healthDataSharingExecutorContract.getHealthDataProviderByAttestationId(attestationId);

            /// @dev - Check whether or not a medical researcher (account) is already paid for the health data
            const _paid: boolean = await healthDataSharingExecutorContract.getPaymentStatus(attestationId, healthDataProvider, account);
            if (!_paid) {
                console.log("This medical researcher (caller) is not paid yet for the health data");
                return { publicInputInHealthDataReceived, name, walletAddress, height, weight, age, gender, raceType, bloodType, bloodPressureSystolic, bloodPressureDiastolic, heartRate, averageHoursOfSleep, onGetHealthDataDecodedReceived };
            }

            /// @dev - Retrieve both the "proof" and "publicInput (before decoded)
            //const healthDataReceived = await healthDataSharingExecutorContract.getHealthData(attestationId);
            //console.log(`healthDataReceived (Both "proof" and "publicInput" before decoded): ${ healthDataReceived }`); /// [Result]: Successful to retrieve the publicInput before decoded (in bytes).

            /// @dev - Retrieve the publicInput (before decoded)
            const publicInputInHealthDataReceived = await healthDataSharingExecutorContract.getPublicInputInHealthData(attestationId, healthDataProvider, account);
            //const publicInputInHealthDataReceived = await healthDataSharingExecutorContract.getPublicInputInHealthData(attestationId);
            console.log(`publicInputInHealthDataReceived ("publicInput" before decoded): ${ publicInputInHealthDataReceived }`);
            setPublicInputInHealthDataReceived(publicInputInHealthDataReceived);

            //let productIdInBytes;
            for (let i = 0; i < publicInputInHealthDataReceived.length; i++) {
                console.log(`publicInputInHealthDataReceived[${i}] ("publicInput" before decoded): ${ publicInputInHealthDataReceived[i] }`);
                console.log(`typeof - publicInputInHealthDataReceived[${i}] ("publicInput" before decoded): ${ typeof publicInputInHealthDataReceived[i] }`); /// [Result]: String

                if (i == 0) {
                    /// @dev - Convert string to bytes
                    const nameInBytes = ethers.getBytes(publicInputInHealthDataReceived[i]);
                    console.log(`nameInBytes: ${nameInBytes}`);
                    console.log(`typeof - Converted bytes: ${typeof nameInBytes}`); /// [Result]: String
                    const nameInUint = await healthDataSharingExecutorContract.bytes32ToUint256(nameInBytes);
                    console.log(`nameInUint: ${nameInUint}`);
                    console.log(`typeof - nameInUint: ${typeof nameInUint}`); /// [Result]: BigInt
                    setName(nameInUint);
                } else if (i == 1) {
                    const walletAddressInString = publicInputInHealthDataReceived[i];
                    const walletAddressInStringSliced = walletAddressInString.slice(26, 66);
                    const walletAddress0xAdded = '0x' + walletAddressInStringSliced;
                    console.log(`walletAddress (slice 26-66): ${walletAddressInString.slice(26, 66)}`);
                    console.log(`walletAddress0xAdded (0x + walletAddressInStringSliced): ${walletAddress0xAdded}`);
                    // Convert to checksum address
                    const checksumWalletAddress = ethers.getAddress(walletAddress0xAdded);
                    console.log(`walletAddress (Checksum Address): ${checksumWalletAddress}`);
                    setWalletAddress(checksumWalletAddress);
                } else if (i == 2) {
                    /// @dev - Convert string to bytes
                    const heightInBytes = ethers.getBytes(publicInputInHealthDataReceived[i]);
                    console.log(`heightBytes: ${heightInBytes}`);
                    console.log(`typeof - Converted bytes: ${typeof heightInBytes}`); /// [Result]: String
                    const heightInUint = await healthDataSharingExecutorContract.bytes32ToUint256(heightInBytes);
                    console.log(`heightInUint: ${heightInUint}`);
                    console.log(`typeof - heightInUint: ${typeof heightInUint}`); /// [Result]: BigInt
                    setHeight(heightInUint);
                } else if (i == 3) {
                    /// @dev - Convert string to bytes
                    const weightInBytes = ethers.getBytes(publicInputInHealthDataReceived[i]);
                    console.log(`weightBytes: ${weightInBytes}`);
                    console.log(`typeof - Converted bytes: ${typeof weightInBytes}`); /// [Result]: String
                    const weightInUint = await healthDataSharingExecutorContract.bytes32ToUint256(weightInBytes);
                    console.log(`weightInUint: ${weightInUint}`);
                    console.log(`typeof - weightInUint: ${typeof weightInUint}`); /// [Result]: BigInt
                    setWeight(weightInUint);
                } else if (i == 4) {
                    /// @dev - Convert string to bytes
                    const ageInBytes = ethers.getBytes(publicInputInHealthDataReceived[i]);
                    console.log(`ageInBytes: ${ageInBytes}`);
                    console.log(`typeof - Converted bytes: ${typeof ageInBytes}`); /// [Result]: String
                    const ageInUint = await healthDataSharingExecutorContract.bytes32ToUint256(ageInBytes);
                    console.log(`ageInUint: ${ageInUint}`);
                    console.log(`typeof - ageInUint: ${typeof ageInUint}`); /// [Result]: BigInt
                    setAge(ageInUint);
                } else if (i == 5) {
                    /// @dev - Convert string to bytes
                    const genderInBytes = ethers.getBytes(publicInputInHealthDataReceived[i]);
                    console.log(`genderInBytes: ${genderInBytes}`);
                    console.log(`typeof - Converted bytes: ${typeof genderInBytes}`); /// [Result]: String
                    const genderInUint = await healthDataSharingExecutorContract.bytes32ToUint256(genderInBytes);
                    console.log(`genderInUint: ${genderInUint}`);
                    console.log(`typeof - ?InUint: ${typeof genderInUint}`); /// [Result]: BigInt
                    setGender(genderInUint);
                } else if (i == 6) {
                    /// @dev - Convert string to bytes
                    const raceTypeInBytes = ethers.getBytes(publicInputInHealthDataReceived[i]);
                    console.log(`raceTypeInBytes: ${raceTypeInBytes}`);
                    console.log(`typeof - Converted bytes: ${typeof raceTypeInBytes}`); /// [Result]: String
                    const raceTypeInUint = await healthDataSharingExecutorContract.bytes32ToUint256(raceTypeInBytes);
                    console.log(`raceTypeInUint: ${raceTypeInUint}`);
                    console.log(`typeof - raceTypeInUint: ${typeof raceTypeInUint}`); /// [Result]: BigInt
                    setRaceType(raceTypeInUint);
                } else if (i == 7) {
                    /// @dev - Convert string to bytes
                    const bloodTypeInBytes = ethers.getBytes(publicInputInHealthDataReceived[i]);
                    console.log(`bloodTypeInBytes: ${bloodTypeInBytes}`);
                    console.log(`typeof - Converted bytes: ${typeof bloodTypeInBytes}`); /// [Result]: String
                    const bloodTypeInUint = await healthDataSharingExecutorContract.bytes32ToUint256(bloodTypeInBytes);
                    console.log(`bloodTypeInUint: ${bloodTypeInUint}`);
                    console.log(`typeof - bloodTypeInUint: ${typeof bloodTypeInUint}`); /// [Result]: BigInt
                    setBloodType(bloodTypeInUint);
                } else if (i == 8) {
                    /// @dev - Convert string to bytes
                    const bloodPressureSystolicInBytes = ethers.getBytes(publicInputInHealthDataReceived[i]);
                    console.log(`bloodPressureSystolicInBytes: ${bloodPressureSystolicInBytes}`);
                    console.log(`typeof - Converted bytes: ${typeof bloodPressureSystolicInBytes}`); /// [Result]: String
                    const bloodPressureSystolicInUint = await healthDataSharingExecutorContract.bytes32ToUint256(bloodPressureSystolicInBytes);
                    console.log(`bloodPressureSystolicInUint: ${bloodPressureSystolicInUint}`);
                    console.log(`typeof - bloodPressureSystolicInUint: ${typeof bloodPressureSystolicInUint}`); /// [Result]: BigInt
                    setBloodPressureSystolic(bloodPressureSystolicInUint);
                } else if (i == 9) {
                    /// @dev - Convert string to bytes
                    const bloodPressureDiastolicInBytes = ethers.getBytes(publicInputInHealthDataReceived[i]);
                    console.log(`bloodPressureDiastolicInBytes: ${bloodPressureDiastolicInBytes}`);
                    console.log(`typeof - Converted bytes: ${typeof bloodPressureDiastolicInBytes}`); /// [Result]: String
                    const bloodPressureDiastolicInUint = await healthDataSharingExecutorContract.bytes32ToUint256(bloodPressureDiastolicInBytes);
                    console.log(`bloodPressureDiastolicInUint: ${bloodPressureDiastolicInUint}`);
                    console.log(`typeof - bloodPressureDiastolicInUint: ${typeof bloodPressureDiastolicInUint}`); /// [Result]: BigInt
                    setBloodPressureDiastolic(bloodPressureDiastolicInUint);
                } else if (i == 10) {
                    /// @dev - Convert string to bytes
                    const heartRateInBytes = ethers.getBytes(publicInputInHealthDataReceived[i]);
                    console.log(`heartRateInBytes: ${heartRateInBytes}`);
                    console.log(`typeof - Converted bytes: ${typeof heartRateInBytes}`); /// [Result]: String
                    const heartRateInUint = await healthDataSharingExecutorContract.bytes32ToUint256(heartRateInBytes);
                    console.log(`heartRateInUint: ${heartRateInUint}`);
                    console.log(`typeof - heartRateInUint: ${typeof heartRateInUint}`); /// [Result]: BigInt
                    setHeartRate(heartRateInUint);
                } else if (i == 11) {
                    /// @dev - Convert string to bytes
                    const averageHoursOfSleepInBytes = ethers.getBytes(publicInputInHealthDataReceived[i]);
                    console.log(`averageHoursOfSleepInBytes: ${averageHoursOfSleepInBytes}`);
                    console.log(`typeof - Converted bytes: ${typeof averageHoursOfSleepInBytes}`); /// [Result]: String
                    const averageHoursOfSleepInUint = await healthDataSharingExecutorContract.bytes32ToUint256(averageHoursOfSleepInBytes);
                    console.log(`averageHoursOfSleepInUint: ${averageHoursOfSleepInUint}`);
                    console.log(`typeof - averageHoursOfSleepInUint: ${typeof averageHoursOfSleepInUint}`); /// [Result]: BigInt
                    setAverageHoursOfSleep(averageHoursOfSleepInUint);
                }
            }

            // // @dev - Return data as a "RevealedData" struct data
            // RevealedData {
            //     name: outputName,
            //     walletAddress: outputWalletAddress,
            //     height: outputHeight,
            //     weight: outputWeight,
            //     age: outputAge,
            //     gender: outputGender,
            //     race_type: outputRaceType,
            //     blood_type: outputBloodType,
            //     blood_pressure_systolic: outputBloodPressureSystolic,
            //     blood_pressure_diastolic: outputBloodPressureDiastolic,
            //     heart_rate: outputHeartRate,
            //     average_hours_of_sleep: outputAverageHoursOfSleep
            // }
        } catch (error: unknown) {
            const errorMessage = (error as Error).message;
            setError(errorMessage);
            setStatus('error'); /// @dev - This message is shown on the bottom of left on the screen (UI).
        }
    };
    
    return { publicInputInHealthDataReceived, name, walletAddress, height, weight, age, gender, raceType, bloodType, bloodPressureSystolic, bloodPressureDiastolic, heartRate, averageHoursOfSleep, onGetHealthDataDecodedReceived };
    //return { healthDataDecodedReceived, onGetHealthDataDecodedReceived };
}


/**
 * @notice - Wait for "ms" mili seconds
 */
export const asyncTimeout = (ms: number) => {
    console.log("Waited 60s");
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};
