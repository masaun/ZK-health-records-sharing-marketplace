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
            console.log("NEXT_PUBLIC_EDU_CHAIN_HEALTH_DATA_SHARING_EXECUTOR_CONTRACT_ADDRESS: ", process.env.NEXT_PUBLIC_EDU_CHAIN_HEALTH_DATA_SHARING_EXECUTOR_CONTRACT_ADDRESS);

            /// @dev - ABI of the HealthDataSharingExecutor.sol
            const abiHealthDataSharingExecutorContract = [
                "function receiveHealthData(uint256 _attestationId) public payable returns(bool)",
                "function getAvailableAttestationIds() public view returns(uint256[] memory _availableAttestationIds)",
                "function getHealthDataDecodedReceived(uint256 _attestationId) public view returns(tuple(uint256 id, string data))",
                "function getHealthData(uint256 _attestationId) public view returns(tuple(bytes proof, bytes32[] publicInput))",
                "function getPublicInputInHealthData(uint256 _attestationId) public view returns(bytes32[] memory _publicInput)",
                //"function getPublicInputInHealthData(uint256 _attestationId) public view returns(tuple(bytes32[] publicInput))",
                "function registerAsHealthDataProvider(address account) public returns(uint256 healthDataProviderId)"
            ];

            const healthDataSharingExecutorContract = new Contract(process.env.NEXT_PUBLIC_EDU_CHAIN_HEALTH_DATA_SHARING_EXECUTOR_CONTRACT_ADDRESS, abiHealthDataSharingExecutorContract, provider);
            const healthDataSharingExecutorContractWithSigner = healthDataSharingExecutorContract.connect(signer);
            
            /// @dev - Call the HealthDataSharingRequester#receiveHealthData()
            const rewardAmountPerSubmission = ethers.parseEther('0.00001'); // 0.00001 $EDU -> 10000000000000 wei in $EDU
            console.log(`rewardAmountPerSubmission: ${rewardAmountPerSubmission} wei in $EDU`);

            /// @dev - Send a transaction to the contract -> Success!!
            // const tx = await signer.sendTransaction({
            //     to: process.env.NEXT_PUBLIC_EDU_CHAIN_HEALTH_DATA_SHARING_EXECUTOR_CONTRACT_ADDRESS,
            //     value: ethers.parseEther('0.00001')
            // });

            /// @dev - Register as a Health Data Provider -> Success!!
            // const txResponse2 = await healthDataSharingExecutorContractWithSigner.registerAsHealthDataProvider(account);
            // await txResponse2.wait();
            // const { hash2 } = await txResponse2;
            // console.log(`Tx sent to EDU Chain (Testnet), tx-hash 2: ${hash2}`);

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
