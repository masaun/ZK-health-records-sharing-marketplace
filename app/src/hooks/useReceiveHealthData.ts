import { useState, useEffect, useRef } from 'react';
import { useAccount } from '@/context/AccountContext';

import { ethers, providers, Contract } from 'ethers';


export function useReceiveHealthData() {
    const [status, setStatus] = useState<string | null>(null);
    const [eventData, setEventData] = useState<any>(null);
    const [txHash, setTxHash] = useState<any>(null);
    const [healthDataDecodedReceived, setHealthDataDecodedReceived] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const onReceiveHealthData = async (
        provider: any, /// Browser Provider, which is retrieved via ethers.js v6
        signer: any,   /// Browser Signer, which is retrieved via ethers.js v6
        account: any,        /// This is also used as a "walletAddress" 
        attestationId: string

    ): Promise<void> => {
        try {
            console.log(`provider: ${JSON.stringify(provider, null, 4)}`);
            console.log(`signer: ${JSON.stringify(signer, null, 4)}`);
            console.log(`account: ${account}`);
            console.log(`attestationId: ${attestationId}`);

            if (!account) {
                throw new Error('EVM Wallet is not selected');
            }

            setStatus('verifying');
            setError(null);

            /// @dev - Wait 60 seconds (2 block + 6 seconds) to wait for that a new attestation is published.
            //await asyncTimeout(60000);

            /// @dev - Retrieve the logs of above.
            console.log("NEXT_PUBLIC_EDU_CHAIN_RPC_URL: ", process.env.NEXT_PUBLIC_EDU_CHAIN_RPC_URL);

            const abiZkvContract = [
                "event AttestationPosted(uint256 indexed _attestationId, bytes32 indexed _proofsAttestation)"
            ];

            /// @dev - ABI of the HealthDataSharingExecutor.sol
            const abiHealthDataSharingExecutorContract = [
                "function submitHealthData(bytes calldata proof, bytes32[] calldata publicInput, uint256 medicalResearcherId, uint256 healthDataSharingRequestId, uint256 _attestationId, bytes32 _leaf, bytes32[] calldata _merklePath, uint256 _leafCount, uint256 _index)",
                "function receiveHealthData(uint256 _attestationId)",
                "function getAvailableAttestationIds() public view returns(uint256[] memory _availableAttestationIds)",
                "function getHealthDataDecodedReceived(uint256 _attestationId) public view returns (tuple(uint256 id, string data))",
                "function getHealthData(uint256 _attestationId) public view returns(tuple(bytes proof, bytes32[] publicInput))",
                "function getPublicInputInHealthData(uint256 _attestationId) public view returns(bytes32[] memory _publicInput)"
                //"function getPublicInputInHealthData(uint256 _attestationId) public view returns(tuple(bytes32[] publicInput))"
            ];

            const zkvContract = new Contract(process.env.NEXT_PUBLIC_EDU_CHAIN_ZKVERIFY_CONTRACT_ADDRESS, abiZkvContract, provider);
            const healthDataSharingExecutorContract = new Contract(process.env.NEXT_PUBLIC_EDU_CHAIN_HEALTH_DATA_SHARING_EXECUTOR_CONTRACT_ADDRESS, abiHealthDataSharingExecutorContract, provider);
            const healthDataSharingExecutorContractWithSigner = healthDataSharingExecutorContract.connect(signer);
            
            /// @dev - Call the HealthDataSharingRequester#receiveHealthData()
            const rewardAmountPerSubmission = ethers.parseEther('0.00001'); // 0.00001 $EDU
            const txResponse = await healthDataSharingExecutorContractWithSigner.receiveHealthData(attestationId, { value: rewardAmountPerSubmission });
            await txResponse.wait();
            const { hash } = await txResponse;
            console.log(`Tx sent to EDU Chain (Testnet), tx-hash ${hash}`);
            setTxHash(hash);

            /// @dev - Retrieve the decoded publicInput
            const healthDataDecodedReceivedStorage = await healthDataSharingExecutorContract.getHealthDataDecodedReceived(attestationId);
            setHealthDataDecodedReceived(healthDataDecodedReceivedStorage);
            console.log(`healthDataDecodedReceivedStorage: ${ healthDataDecodedReceivedStorage }`);
            //console.log(`healthDataDecodedReceivedStorage: ${JSON.stringify(healthDataDecodedReceivedStorage, null, 4)}`);
        } catch (error: unknown) {
            const errorMessage = (error as Error).message;
            setError(errorMessage);
            setStatus('error'); /// @dev - This message is shown on the bottom of left on the screen (UI).
        }
    };

    return { status, error, txHash, healthDataDecodedReceived, onReceiveHealthData };
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
