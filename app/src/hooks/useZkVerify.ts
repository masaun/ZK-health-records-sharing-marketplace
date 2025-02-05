import { useState, useEffect, useRef } from 'react';
import { useAccount } from '@/context/AccountContext';
import { ethers, providers, Contract } from 'ethers';
import Web3Modal from 'web3modal';

export function useZkVerify() {
    /////////////////////////////////////////////////////////////
    /// Connect with a browser wallet (i.e. MetaMask)
    /////////////////////////////////////////////////////////////
    // walletConnected keep track of whether the user's wallet is connected or not
    const [walletConnected, setWalletConnected] = useState<boolean>(false);
    // joinedWhitelist keeps track of whether the current metamask address has joined the Whitelist or not
    const [joinedWhitelist, setJoinedWhitelist] = useState<boolean>(false);
    // loading is set to true when we are waiting for a transaction to get mined
    const [loading, setLoading] = useState<boolean>(false);
    // numberOfWhitelisted tracks the number of addresses's whitelisted
    const [numberOfWhitelisted, setNumberOfWhitelisted] = useState<any>(0);
    // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
    const web3ModalRef = useRef();

    /**
     * Returns a Provider or Signer object representing the Ethereum RPC with or without the
     * signing capabilities of metamask attached
     *
     * A `Provider` is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc.
     *
     * A `Signer` is a special type of Provider used in case a `write` transaction needs to be made to the blockchain, which involves the connected account
     * needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to allow your website to
     * request signatures from the user using Signer functions.
     */
    const getProviderOrSigner = async (needSigner = false) => {
        // Connect to Metamask
        // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
        const provider = await web3ModalRef.current.connect();
        const web3Provider = new providers.Web3Provider(provider);

        // If user is not connected to the Rinkeby network, let them know and throw an error
        const { chainId } = await web3Provider.getNetwork();
        if (chainId !== 4) {
            window.alert("Change the network to Rinkeby");
            throw new Error("Change network to Rinkeby");
        }

        if (needSigner) {
            const signer = web3Provider.getSigner();
            return signer;
        }
        return web3Provider;
    };

    /*
    *  connectWallet: Connects the MetaMask wallet
    */
    const connectWallet = async () => {
        try {
            // Get the provider from web3Modal, which in our case is MetaMask
            // When used for the first time, it prompts the user to connect their wallet
            await getProviderOrSigner();
            setWalletConnected(true);

            //checkIfAddressInWhitelist();
            //getNumberOfWhitelisted();
        } catch (err) {
            console.error(err);
        }
    };

    // useEffects are used to react to changes in state of the website
    // The array at the end of function call represents what state changes will trigger this effect
    // In this case, whenever the value of `walletConnected` changes - this effect will be called
    useEffect(() => {
        // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
        if (!walletConnected) {
            // Assign the Web3Modal class to the reference object by setting it's `current` value
            // The `current` value is persisted throughout as long as this page is open
            web3ModalRef.current = new Web3Modal({
            network: "eduChain", /// [TODO]: Should be replaced with an appropreate network name.
            providerOptions: {},
            disableInjectedProvider: false,
            });
            connectWallet();
        }
    }, [walletConnected]);


    /////////////////////////////////////////////////////////////
    /// zkVerify
    /////////////////////////////////////////////////////////////
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

            /// @dev - Wait 30 seconds (2 block + 6 seconds) to wait for that a new attestation is published.
            await asyncTimeout(30000);
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
                "function submitHealthData(bytes calldata proof, bytes32[] calldata publicInput, uint256 medicalResearcherId, uint256 healthDataSharingRequestId, uint256 _attestationId, bytes32 _leaf, bytes32[] calldata _merklePath, uint256 _leafCount, uint256 _index)"
            ];

            const zkvContract = new ethers.Contract(EDU_CHAIN_ZKVERIFY_CONTRACT_ADDRESS, abiZkvContract, provider);
            const appContract = new ethers.Contract(EDU_CHAIN_APP_CONTRACT_ADDRESS, abiAppContract, wallet);

            const filterAttestationsById = zkvContract.filters.AttestationPosted(attestationId, null);
            console.log(`filterAttestationsById: ${filterAttestationsById}`);
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


/**
 * @notice - Wait for "ms" mili seconds
 */
export const asyncTimeout = (ms: number) => {
    console.log("Waited 30s");
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};
