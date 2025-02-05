import { useState } from 'react';
import { useAccount } from '@/context/AccountContext';
import { ethers } from 'ethers';

export function useZkVerify() {
    const { selectedAccount, selectedWallet } = useAccount();
    const [status, setStatus] = useState<string | null>(null);
    const [eventData, setEventData] = useState<any>(null);
    const [transactionResult, setTransactionResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const onVerifyProof = async (
        proof: string,
        publicSignals: any,
        vk: any
    ): Promise<void> => {
        try {
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

            /// @dev - Retrieve the logs of above.
            console.log("events: ", events);
            console.log("transactionResult: ", transactionResult);

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

            // Retrieve via rpc call:
            // - the merkle proof of inclusion of the proof inside the attestation
            // - the total number of leaves of the attestation merkle tree
            // - the leaf index of our proof
            let merkleProof, numberOfLeaves, leafIndex;
            try {
                const proofDetails = await session.poe(attestationId, leafDigest);
                ({ proof: merkleProof, numberOfLeaves, leafIndex } = await proofDetails);
                console.log(`Merkle proof details`)
                console.log(`\tmerkleProof: ${merkleProof}`);
                console.log(`\tnumberOfLeaves: ${numberOfLeaves}`);
                console.log(`\tleafIndex: ${leafIndex}`);
            } catch (error) {
                console.error('RPC failed:', error);
            }

            const provider = new ethers.JsonRpcProvider(EDU_CHAIN_RPC_URL, null, { polling: true });
            const wallet = new ethers.Wallet(EDU_CHAIN_SECRET_KEY, provider);

            const abiZkvContract = [
                "event AttestationPosted(uint256 indexed attestationId, bytes32 indexed root)"
            ];

            /// @dev - HealthDataSharingExecutor#submitHealthData()
            const abiAppContract = [
                "function submitHealthData(bytes calldata proof, bytes32[] calldata publicInput, uint256 medicalResearcherId, uint256 healthDataSharingRequestId, uint256 _attestationId, bytes32 _leaf, bytes32[] calldata _merklePath, uint256 _leafCount, uint256 _index)",
                "event SuccessfulProofSubmission(address indexed from)"
            ];

            const zkvContract = new ethers.Contract(EDU_CHAIN_ZKVERIFY_CONTRACT_ADDRESS, abiZkvContract, provider);
            const appContract = new ethers.Contract(EDU_CHAIN_APP_CONTRACT_ADDRESS, abiAppContract, wallet);

            const filterAttestationsById = zkvContract.filters.AttestationPosted(attestationId, null);
            zkvContract.once(filterAttestationsById, async (_id, _root) => {
                let medicalResearcherId = 1;        /// [TODO]: Replace with a dynamic value
                let healthDataSharingRequestId = 1; /// [TODO]: Replace with a dynamic value
                // After the attestation has been posted on the EVM, send a `submitHealthData` tx
                // to the app contract, with all the necessary merkle proof details
                const txResponse = await appContract.submitHealthData( // @dev - HealthDataSharingExecutor#submitHealthData()
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
                const { hash } = await txResponse;
                console.log(`Tx sent to EDU Chain (Testnet), tx-hash ${hash}`);
            });

            const filterAppEventsByCaller = appContract.filters.SuccessfulProofSubmission(evmAccount);
            appContract.once(filterAppEventsByCaller, async () => {
                console.log("App contract has acknowledged that you can submit health data!")
            })

            ////////////////////////////////////////////////////////////////////////
            /// End
            ////////////////////////////////////////////////////////////////////////
        } catch (error: unknown) {
            const errorMessage = (error as Error).message;
            setError(errorMessage);
            setStatus('error');
        }
    };

    return { status, eventData, transactionResult, error, onVerifyProof }; /// @dev - NOTE: This line is the orignal return values.
}
