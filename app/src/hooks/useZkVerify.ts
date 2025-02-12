import { useState, useEffect, useRef } from 'react';
import { useAccount } from '@/context/AccountContext';

import { ethers, providers, Contract } from 'ethers';


export function useZkVerify() {
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
        proof: string,
        publicSignals: any,
        vk: any,
        provider: any, /// Browser Provider, which is retrieved via ethers.js v6
        signer: any,   /// Browser Signer, which is retrieved via ethers.js v6
        account: any        /// This is also used as a "walletAddress" 
        // name: string,        /// Input value via UI
        // height: string,
        // weight: string,
        // age: string,
        // gender: string,        // 1: "Male", 2: "Female", 3: "Other"
        // race_type: string,     // 1: "White", 2: "Black", 3: "Yello"
        // blood_type: string,    // 1: "A", 2: "B", 3: "AB", 4: "O" 
        // blood_pressure: string,
        // heart_rate: string,
        // average_hours_of_sleep: string,
        // revealName: boolean,
        // revealWalletAddress: boolean,
        // revealAge: boolean,
        // revealGender: boolean,
        // revealHeight: boolean,
        // revealWeight: boolean,
        // revealRaceType: boolean,
        // revealBloodType: boolean,
        // revealBloodPressure: boolean,
        // revealHeartRate: boolean,
        // revealAverageHoursOfSleep: boolean
    ): Promise<void> => {
        try {
            console.log(`provider: ${JSON.stringify(provider, null, 4)}`);
            console.log(`signer: ${JSON.stringify(signer, null, 4)}`);
            console.log(`account: ${account}`);
            // console.log(`name: ${name}`);
            // console.log(`revealProviderId: ${revealProviderId}`);
            // console.log(`revealName: ${revealName}`);
            // console.log(`revealWalletAddress: ${revealWalletAddress}`);
            // console.log(`revealAge: ${revealAge}`);
            // console.log(`revealGender: ${revealGender}`);

            if (!proof || !publicSignals || !vk) {
                throw new Error('Proof, public signals, or verification key is missing');
            }

            if (!selectedWallet || !selectedAccount) {
                throw new Error('Wallet or account is not selected');
            }

            const proofData = proof;
            const { zkVerifySession } = await import('zkverifyjs');
            const session = await zkVerifySession.start().Testnet().withWallet({
                source: selectedWallet,
                accountAddress: selectedAccount,
            });

            setStatus('verifying');
            setError(null);
            setTransactionResult(null);

            /// @dev - For submitting a Groth16 proof of RISC Zero
            // const { events, transactionResult } = await session.verify().risc0().execute({
            //     proofData: {
            //         proof: proofData,
            //         publicSignals: publicSignals,
            //         vk: vk,
            //         version: 'V1_0'
            //     }
            // });

            /// @dev - For submitting a UltraPlonk proof of Noir
            const { events, transactionResult } = await session.verify()
                .ultraplonk()
                .execute({
                proofData: {
                    proof: proofData,
                    publicSignals: publicSignals,
                    vk: vk
                }
            });

            events.on('includedInBlock', (data: any) => {
                setStatus('includedInBlock');
                setEventData(data);
            });

            let transactionInfo = null;
            try {
                transactionInfo = await transactionResult;
                setTransactionResult(transactionInfo);
            } catch (error: unknown) {
                if ((error as Error).message.includes('Rejected by user')) {
                    setError('Transaction Rejected By User.');
                    setStatus('cancelled');
                    return;
                }
                throw new Error(`Transaction failed: ${(error as Error).message}`);
            }

            if (transactionInfo && transactionInfo.attestationId) {
                setStatus('verified');
            } else {
                throw new Error("Your proof isn't correct.");
            }

            ////////////////////////////////////////////////////////////////////////
            /// The code below is for retrieving the merkle proof, leaf index, etc. 
            ////////////////////////////////////////////////////////////////////////
            /// @dev - Retrieve the logs of above.
            console.log("events: ", events);
            console.log("transactionResult: ", transactionResult);

            // Upon successful publication on zkVerify of the attestation containing the proof, extract:
            // - the attestation id
            // - the leaf digest (i.e. the structured hash of the statement of the proof)
            let attestationId, leafDigest;
            try {
                ({ attestationId, leafDigest } = await transactionResult);
                console.log(`Attestation published on zkVerify`)
                console.log(`\tattestationId: ${attestationId}`); /// [Log]: i.e). 28836
                console.log(`\tleafDigest: ${leafDigest}`);       /// [Log]: i.e). 0x394c1161bbec36222eee5ede34594fe5f38082daa2ac896852cba35bdd952b3b    
            } catch (error) {
                console.error('Transaction failed:', error);
            }

            /// @dev - Wait 60 seconds (2 block + 6 seconds) to wait for that a new attestation is published.
            await asyncTimeout(60000);
            // setTimeout(() => {
            //     console.log("Waited 60s");
            // }, 60000);

            // Retrieve via rpc call:
            // - the merkle proof of inclusion of the proof inside the attestation
            // - the total number of leaves of the attestation merkle tree
            // - the leaf index of our proof
            let merkleProof, numberOfLeaves, leafIndex;
            try {
                const proofDetails = await session.poe(attestationId, leafDigest);
                ({ proof: merkleProof, numberOfLeaves, leafIndex } = await proofDetails);
                console.log(`Merkle proof details`);
                console.log(`\tproofDetails: ${JSON.stringify(proofDetails, null, 4)}`);
                console.log(`\tmerkleProof: ${merkleProof}`);
                console.log(`\tnumberOfLeaves: ${numberOfLeaves}`);
                console.log(`\tleafIndex: ${leafIndex}`);
                let proofInfo = await proofDetails;
                setMerkleProofDetails(proofInfo);
            } catch (error) {
                console.error('RPC failed:', error);
            }

            /// @dev - Retrieve the logs of above.
            console.log("NEXT_PUBLIC_EDU_CHAIN_RPC_URL: ", process.env.NEXT_PUBLIC_EDU_CHAIN_RPC_URL);

            const abiZkvContract = [
                "event AttestationPosted(uint256 indexed _attestationId, bytes32 indexed _proofsAttestation)"
            ];

            /// @dev - HealthDataSharingExecutor#submitHealthData()
            const abiAppContract = [
                "function submitHealthData(bytes calldata proof, bytes32[] calldata publicInput, uint256 medicalResearcherId, uint256 healthDataSharingRequestId, uint256 _attestationId, bytes32 _leaf, bytes32[] calldata _merklePath, uint256 _leafCount, uint256 _index)"
            ];

            const zkvContract = new Contract(process.env.NEXT_PUBLIC_EDU_CHAIN_ZKVERIFY_CONTRACT_ADDRESS, abiZkvContract, provider);
            const appContract = new Contract(process.env.NEXT_PUBLIC_EDU_CHAIN_APP_CONTRACT_ADDRESS, abiAppContract, provider);
            //const appContract = new ethers.Contract(process.env.NEXT_PUBLIC_EDU_CHAIN_APP_CONTRACT_ADDRESS, abiAppContract, wallet);
            const appContractWithSigner = appContract.connect(signer);

            /// @dev - Call the HealthDataSharingExecutor#submitHealthData()
            // After the attestation has been posted on the EVM, send a `submitHealthData` tx
            // to the app contract, with all the necessary merkle proof details
            const txResponse = await appContractWithSigner.submitHealthData(  // @dev - HealthDataSharingExecutor#submitHealthData()
            //const txResponse = await appContract.submitHealthData(          // @dev - HealthDataSharingExecutor#submitHealthData()
                proofData,
                publicSignals,
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
            // zkvContract.once(filterAttestationsById, async (_attestationId, _proofsAttestation) => {
            //     let medicalResearcherId = 1;        /// [TODO]: Replace with a dynamic value
            //     let healthDataSharingRequestId = 1; /// [TODO]: Replace with a dynamic value
            //     // After the attestation has been posted on the EVM, send a `submitHealthData` tx
            //     // to the app contract, with all the necessary merkle proof details
            //     const txResponse = await appContractWithSigner.submitHealthData(  // @dev - HealthDataSharingExecutor#submitHealthData()
            //     //const txResponse = await appContract.submitHealthData(          // @dev - HealthDataSharingExecutor#submitHealthData()
            //         proofData,
            //         publicSignals,
            //         medicalResearcherId,
            //         healthDataSharingRequestId,
            //         attestationId,
            //         leafDigest,  /// leaf
            //         merkleProof,
            //         numberOfLeaves,
            //         leafIndex
            //     );
            //     await txResponse.wait();
            //     const { hash } = await txResponse;
            //     console.log(`Tx sent to EDU Chain (Testnet), tx-hash ${hash}`);
            // });

            // const evmAccount = ethers.computeAddress(process.env.NEXT_PUBLIC_EDU_CHAIN_SECRET_KEY);
            // const filterAppEventsByCaller = appContract.filters.SuccessfulProofSubmission(evmAccount);
            // appContract.once(filterAppEventsByCaller, async () => {
            //     console.log("App contract has acknowledged that you can submit health data!")
            // })



            ////////////////////////////////////////////////////////////////////////
            /// End
            ////////////////////////////////////////////////////////////////////////
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
