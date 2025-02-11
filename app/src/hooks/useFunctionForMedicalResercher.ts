import { useState, useEffect, useRef } from 'react';
import { useAccount } from '@/context/AccountContext';

import { ethers, providers, Contract } from 'ethers';


export function useFunctionForMedicalResercher() {
    /////////////////////////////////////////////////////////////
    /// zkVerify
    /////////////////////////////////////////////////////////////
    const { selectedAccount, selectedWallet } = useAccount();
    const [status, setStatus] = useState<string | null>(null);
    const [eventData, setEventData] = useState<any>(null);
    const [transactionResult, setTransactionResult] = useState<any>(null);
    const [merkleProofDetails, setMerkleProofDetails] = useState<any>(null);
    const [txHash, setTxHash] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const onVerifyProof = async (
        provider: any, /// Browser Provider, which is retrieved via ethers.js v6
        signer: any,   /// Browser Signer, which is retrieved via ethers.js v6
        account: any,        /// This is also used as a "walletAddress" 
        productId: string,   /// Input value via UI
        providerId: string,  /// Input value via UI
        name: string,        /// Input value via UI
        height: string,
        weight: string,
        age: string,
        gender: string,        // 1: "Male", 2: "Female", 3: "Other"
        race_type: string,     // 1: "White", 2: "Black", 3: "Yello"
        blood_type: string,    // 1: "A", 2: "B", 3: "AB", 4: "O" 
        blood_pressure: string,
        heart_rate: string,
        average_hours_of_sleep: string,

    ): Promise<void> => {
        try {
            console.log(`provider: ${JSON.stringify(provider, null, 4)}`);
            console.log(`signer: ${JSON.stringify(signer, null, 4)}`);
            console.log(`account: ${account}`);
            console.log(`productId: ${productId}`);
            console.log(`providerId: ${providerId}`);
            console.log(`name: ${name}`);
            console.log(`revealProviderId: ${revealProviderId}`);
            console.log(`revealName: ${revealName}`);
            console.log(`revealWalletAddress: ${revealWalletAddress}`);
            console.log(`revealAge: ${revealAge}`);
            console.log(`revealGender: ${revealGender}`);

            if (!account) {
                throw new Error('EVM Wallet is not selected');
            }

            setStatus('verifying');
            setError(null);
            setTransactionResult(null);

            /// @dev - Wait 60 seconds (2 block + 6 seconds) to wait for that a new attestation is published.
            //await asyncTimeout(60000);

            /// @dev - Retrieve the logs of above.
            console.log("NEXT_PUBLIC_EDU_CHAIN_RPC_URL: ", process.env.NEXT_PUBLIC_EDU_CHAIN_RPC_URL);

            const abiZkvContract = [
                "event AttestationPosted(uint256 indexed _attestationId, bytes32 indexed _proofsAttestation)"
            ];

            /// @dev - HealthDataSharingRequester.sol
            const abiAppContract = [
                "function submitHealthData(bytes calldata proof, bytes32[] calldata publicInput, uint256 medicalResearcherId, uint256 healthDataSharingRequestId, uint256 _attestationId, bytes32 _leaf, bytes32[] calldata _merklePath, uint256 _leafCount, uint256 _index)"
            ];

            const zkvContract = new Contract(process.env.NEXT_PUBLIC_EDU_CHAIN_ZKVERIFY_CONTRACT_ADDRESS, abiZkvContract, provider);
            const healthDataSharingRequesterContract = new Contract(process.env.NEXT_PUBLIC_EDU_CHAIN_HEALTH_DATA_SHARING_REQUESTER_CONTRACT_ADDRESS, abiAppContract, provider);
            const healthDataSharingExecutorContract = new Contract(process.env.NEXT_PUBLIC_EDU_CHAIN_HEALTH_DATA_SHARING_EXECUTOR_CONTRACT_ADDRESS, abiAppContract, provider);
            const healthDataSharingRequesterContractWithSigner = healthDataSharingRequesterContract.connect(signer);
            const healthDataSharingExecutorContractWithSigner = healthDataSharingExecutorContract.connect(signer);
            
            /// @dev - Call the HealthDataSharingExecutor#submitHealthData()
            let medicalResearcherId = 1;        /// [TODO]: Replace with a dynamic value
            let healthDataSharingRequestId = 1; /// [TODO]: Replace with a dynamic value
            // After the attestation has been posted on the EVM, send a `submitHealthData` tx
            // to the app contract, with all the necessary merkle proof details
            const txResponse = await healthDataSharingRequesterContractWithSigner.submitHealthData(  // @dev - HealthDataSharingRequester#submitHealthData()
                proofData,
                publicSignals,
                medicalResearcherId,
                healthDataSharingRequestId,
                attestationId,
                leafDigest,  /// leaf
                merkleProof,
                numberOfLeaves,
                leafIndex
            );
            await txResponse.wait();
            const { hash } = await txResponse;
            console.log(`Tx sent to EDU Chain (Testnet), tx-hash ${hash}`);
            setTxHash(hash);


            /// @dev - Added below for retrieving the "AttestationPosted" event-emitted.
            zkvContract.on(
                "AttestationPosted", (_attestationId, _proofsAttestation, event) => {
                    console.log(`attestationId: ${ _attestationId } / proofsAttestation: ${ _proofsAttestation }`);
                    console.log(`event: ${JSON.stringify(event, null, 4)}`);
                }
            );

            const filterAttestationsById = zkvContract.filters.AttestationPosted(attestationId, null);
            console.log(`filterAttestationsById: ${JSON.stringify(filterAttestationsById)}`, null, 4);
        } catch (error: unknown) {
            const errorMessage = (error as Error).message;
            setError(errorMessage);
            setStatus('error'); /// @dev - This message is shown on the bottom of left on the screen (UI).
        }
    };

    //return { status, eventData, transactionResult, error, onVerifyProof };                                  
    return { status, eventData, transactionResult, merkleProofDetails, txHash, error, onVerifyProof };
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
