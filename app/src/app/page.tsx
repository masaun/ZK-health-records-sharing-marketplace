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
  const { onVerifyProof, status, eventData, transactionResult, merkleProofDetails, txHash, error } = useZkVerify(); 
  //const { onVerifyProof, status, eventData, transactionResult, error } = useZkVerify(); 

  /////////////////////////////////////////////////////////////
  /// Connect with a browser wallet (i.e. MetaMask)
  /////////////////////////////////////////////////////////////
  const [provider, setProvider] = useState();
  const [signer, setSigner] = useState();
  const [account, setAccount] = useState();
  const [walletConnected, setWalletConnected] = useState<boolean>(false); // walletConnected keep track of whether the user's wallet (i.e. MetaMask) is connected or not

  /*
  *  connectWallet: Connects the MetaMask wallet
  */
  const connectWallet = async () => {
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    if (typeof window !== "undefined") {
      let browserSigner = null;
      let browserProvider;
      let browserAccount;
      if (window.ethereum) {
        browserProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(browserProvider);
        //const provider = new ethers.JsonRpcProvider(EDU_CHAIN_RPC_URL, null, { polling: true });
        console.log("browserProvider: ", await browserProvider);

        browserSigner = await browserProvider.getSigner(); // Assumes Metamask or similar is injected in the browser
        setSigner(browserSigner);
        console.log("browserSigner: ", await browserProvider);

        const accounts = await browserProvider.send("eth_requestAccounts", []);
        browserAccount = accounts[0];
        setAccount(browserAccount);
        console.log("browserAccount: ", await browserAccount);

        setWalletConnected(true);
      } else {
        console.error("Please install MetaMask! (or any EVM Wallet)");
        //console.log("MetaMask not installed; using read-only defaults")
        browserProvider = ethers.getDefaultProvider()
      }
    }
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
      await onVerifyProof(provider, signer, account, proof, publicSignals, vk); /// @dev - useZkVerify.ts + Web3 Provider
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

    if (!walletConnected) {
      connectWallet(); /// @dev - Connetct an EVM wallet (i.e. MetaMask)
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

            {merkleProofDetails && (
                <div className={styles.transactionDetails}>
                  <p>Merkle Proof: {merkleProofDetails.merkleProof || 'N/A'}</p>
                  <p>Number Of Leaves: {merkleProofDetails.numberOfLeaves || 'N/A'}</p>
                  <p>Leaf Index: {merkleProofDetails.leafIndex || 'N/A'}</p>
                  merkleProofDetails, txHash
                </div>
            )} 

            {txHash && (
                <div className={styles.transactionDetails}>
                  <p>Tx Hash-sent to EDU Chain: {txHash || 'N/A'}</p>
                </div>
            )} 
          </div>
        </div>
      </div>
  );
}
