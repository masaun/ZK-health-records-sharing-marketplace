'use client';
import { useState, useRef, useEffect } from 'react';
import { useAccount } from '@/context/AccountContext';
import ConnectWalletButton, { ConnectWalletButtonHandle } from '../components/ConnectWalletButton';
import { useZkVerify } from '@/hooks/useZkVerify';
import styles from './page.module.css';
//import proofData from '../proofs/risc0_v1_0.json';   /// @dev - For a Groth16 proof of RISC Zero
//import proofData from '../proofs/ultraplonk.json';   /// @dev - For a UltraPlonk proof of Noir
//import proofData from '../proofs/ultraplonk_with-foundry.json';  /// @dev - For a UltraPlonk proof of Noir
//import proofData from '../proofs/ultraplonk_zkv.json';  /// @dev - For a UltraPlonk proof of Noir
import proofData from '../../../circuits/zkVerify/final-output/ultraplonk_health_data_sharing_zkv.json';  /// @dev - For a UltraPlonk proof of Noir
import Image from 'next/image';

import { ethers, BrowserProvider, Contract } from 'ethers';


export default function Home() {
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<string | null>(null);
  const [blockHash, setBlockHash] = useState<string | null>(null);
  const walletButtonRef = useRef<ConnectWalletButtonHandle | null>(null);
  const { selectedAccount, selectedWallet } = useAccount();
  const { onVerifyProof, status, eventData, transactionResult, error } = useZkVerify();

  /////////////////////////////////////////////////////////////
  /// Connect with a browser wallet (i.e. MetaMask)
  /////////////////////////////////////////////////////////////
  let [provider, setProvider] = useState();
  provider = new BrowserProvider(window.ethereum);
  const [walletConnected, setWalletConnected] = useState<boolean>(false); // walletConnected keep track of whether the user's wallet (i.e. MetaMask) is connected or not

  /*
  *  connectWallet: Connects the MetaMask wallet
  */
  const connectWallet = async () => {
    try {
        const browserProvider = new BrowserProvider(window.ethereum);
        setProvider(browserProvider);

        await provider.send("eth_requestAccounts");

        // Get the provider from web3Modal, which in our case is MetaMask
        // When used for the first time, it prompts the user to connect their wallet
        await getProviderOrSigner();
        setWalletConnected(true);
    } catch (err) {
        console.error(err);
    }
  };

  const getProviderOrSigner = async (needSigner = false) => {
    // Connect to Metamask
    // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
    //const provider = await web3ModalRef.current.connect();
    //const web3Provider = new providers.Web3Provider(provider);
    const web3Provider = provider;

    // If user is not connected to the Rinkeby network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 656476) {
        window.alert("Change the network to EDU Chain (Open Campus) - testnet");
        throw new Error("Change network to EDU Chain (Open Campus) - testnet");
    }

    if (needSigner) {
        const signer = web3Provider.getSigner();
        return signer;
    }
    return web3Provider;
  };

  /////////////////////////////////////////////////////////////
  /// zkVerify
  /////////////////////////////////////////////////////////////
  const handleSubmit = async () => {
    if (!selectedAccount || !selectedWallet) {
      setVerificationResult('Please connect a wallet and select an account.');
      return;
    }

    setLoading(true);
    setVerificationResult(null);
    setBlockHash(null);

    const { vk, publicSignals, proof } = proofData;

    try {
      await onVerifyProof(provider, proof, publicSignals, vk); /// @dev - useZkVerify.ts + Web3 Provider
      //await onVerifyProof(proof, publicSignals, vk); /// @dev - useZkVerify.ts
    } catch (error) {
      setVerificationResult(`Error: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (error) {
      setVerificationResult(error);
    } else if (status === 'verified') {
      setVerificationResult('Proof verified successfully!');
      if (eventData?.blockHash) {
        setBlockHash(eventData.blockHash);
      }
    } else if (status === 'includedInBlock' && eventData) {
      setVerificationResult('Transaction Included In Block');
    } else if (status === 'cancelled') {
      setVerificationResult('Transaction Rejected By User.');
    }

    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    if (!walletConnected) {
      connectWallet();
    }

  }, [error, status, eventData, walletConnected]);
  //}, [error, status, eventData]);

  const blockExplorerUrl = blockHash
      ? `https://testnet-explorer.zkverify.io/v0/block/${blockHash}`
      : null;

  return (
      <div className={styles.page}>
        <div className={styles.main}>
          <Image
              src="/zk_Verify_logo_full_black.png"
              alt="zkVerify Logo"
              width={450}
              height={150}
          />

          <ConnectWalletButton ref={walletButtonRef} onWalletConnected={() => {}} />

          <button
              onClick={handleSubmit}
              className={`button ${styles.verifyButton}`}
              disabled={!selectedAccount || !selectedWallet || loading}
          >
            {loading ? (
                <>
                  Submitting...
                  <div className="spinner"></div>
                </>
            ) : (
                'Submit Proof'
            )}
          </button>

          <div className={styles.resultContainer}>
            {verificationResult && (
                <p
                    className={
                      verificationResult.includes('failed') ||
                      verificationResult.includes('Error') ||
                      verificationResult.includes('Rejected')
                          ? styles.resultError
                          : styles.resultSuccess
                    }
                >
                  {verificationResult}
                </p>
            )}

            {eventData && status === 'includedInBlock' && (
                <div className={styles.resultSection}>
                  <p>Block Hash: {eventData.blockHash || 'N/A'}</p>
                </div>
            )}

            {blockExplorerUrl && (
                <div className={styles.resultLink}>
                  <a href={blockExplorerUrl} target="_blank" rel="noopener noreferrer">
                    View Transaction on Explorer
                  </a>
                </div>
            )}

            {transactionResult && (
                <div className={styles.transactionDetails}>
                  <p>Transaction Hash: {transactionResult.txHash || 'N/A'}</p>
                  <p>Proof Type: {transactionResult.proofType || 'N/A'}</p>
                  <p>Attestation ID: {transactionResult.attestationId || 'N/A'}</p>
                </div>
            )}
          </div>
        </div>
      </div>
  );
}
