import { useState, useEffect, useRef } from 'react';
import { useAccount } from '@/context/AccountContext';

import { ethers, providers, Contract } from 'ethers';


export function useGetHealthDataDecodedReceived() {
    const [healthDataDecodedReceived, setHealthDataDecodedReceived] = useState<any>(null);
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
                "function submitHealthData(bytes calldata proof, bytes32[] calldata publicInput, uint256 medicalResearcherId, uint256 healthDataSharingRequestId, uint256 _attestationId, bytes32 _leaf, bytes32[] calldata _merklePath, uint256 _leafCount, uint256 _index)",
                "function receiveHealthData(uint256 _attestationId)",
                "function getAvailableAttestationIds() public view returns(uint256[] memory _availableAttestationIds)",
                "function getHealthDataDecodedReceived(uint256 _attestationId) public view returns (tuple(uint256 id, string data))",
                "function getHealthData(uint256 _attestationId) public view returns(tuple(bytes proof, bytes32[] publicInput))",
                "function getPublicInputInHealthData(uint256 _attestationId) public view returns(bytes32[] memory _publicInput)",
                //"function getPublicInputInHealthData(uint256 _attestationId) public view returns(tuple(bytes32[] publicInput))",
                "function bytes32ToUint256(bytes32 data) public pure returns (uint256)"
            ];

            const healthDataSharingExecutorContract = new Contract(process.env.NEXT_PUBLIC_EDU_CHAIN_HEALTH_DATA_SHARING_EXECUTOR_CONTRACT_ADDRESS, abiHealthDataSharingExecutorContract, provider);
            const healthDataSharingExecutorContractWithSigner = healthDataSharingExecutorContract.connect(signer);

            /// @dev - Retrieve the decoded publicInput
            const healthDataDecodedReceivedStorage = await healthDataSharingExecutorContract.getHealthDataDecodedReceived(attestationId);
            setHealthDataDecodedReceived(healthDataDecodedReceivedStorage);
            console.log(`healthDataDecodedReceivedStorage: ${ healthDataDecodedReceivedStorage }`);
            console.log(`healthDataDecodedReceived: ${ healthDataDecodedReceived }`);
            //console.log(`healthDataDecodedReceivedStorage: ${JSON.stringify(healthDataDecodedReceivedStorage, null, 4)}`);

            /// @dev - Retrieve the publicInput (before decoded)
            const healthDataReceived = await healthDataSharingExecutorContract.getHealthData(attestationId);
            console.log(`healthDataReceived (Both "proof" and "publicInput" before decoded): ${ healthDataReceived }`); /// [Result]: Successful to retrieve the publicInput before decoded (in bytes).

            /// @dev - Retrieve the publicInput (before decoded)
            const publicInputInHealthDataReceived = await healthDataSharingExecutorContract.getPublicInputInHealthData(attestationId);
            console.log(`publicInputInHealthDataReceived ("publicInput" before decoded): ${ publicInputInHealthDataReceived }`);
            console.log(`publicInputInHealthDataReceived[0] ("publicInput" before decoded): ${ publicInputInHealthDataReceived[0] }`);
            console.log(`typeof - publicInputInHealthDataReceived[0] ("publicInput" before decoded): ${ typeof publicInputInHealthDataReceived[0] }`); /// [Result]: String

            /// @dev - Convert string to bytes
            const bytes = ethers.getBytes(publicInputInHealthDataReceived[0]);
            console.log(`Converted bytes: ${bytes}`);
            console.log(`typeof - Converted bytes: ${typeof bytes}`); /// [Result]: String
            const uint256Value = await healthDataSharingExecutorContract.bytes32ToUint256(bytes);
            console.log(`uint256Value: ${uint256Value}`);
            console.log(`typeof - uint256Value: ${typeof uint256Value}`); /// [Result]: Number
        } catch (error: unknown) {
            const errorMessage = (error as Error).message;
            setError(errorMessage);
            setStatus('error'); /// @dev - This message is shown on the bottom of left on the screen (UI).
        }
    };

    return { healthDataDecodedReceived, onGetHealthDataDecodedReceived };
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
