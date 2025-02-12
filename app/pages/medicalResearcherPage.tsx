'use client';
import { useState, useRef, useEffect } from 'react';
import ConnectEVMWalletButton from '../src/components/ConnectEVMWalletButton';
import { useConnectEVMWallet } from '../src/hooks/useConnectEVMWallet';
import { useGetBalance } from '../src/hooks/useGetBalance';
import { useReceiveHealthData } from '../src/hooks/useReceiveHealthData';
import { useGetAvailableAttestationIds } from '../src/hooks/useGetAvailableAttestationIds';
import styles from './page.module.css';
//import styles from '../src/app/page.module.css';
import globalStyles from '../src/app/globals.css';
import Image from 'next/image';
import Link from 'next/link';

import { ethers, BrowserProvider, Contract } from 'ethers';


export default function MedicalResearcherPage() {
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<string | null>(null);
  const [blockHash, setBlockHash] = useState<string | null>(null);
  const walletButtonRef = useRef<ConnectWalletButtonHandle | null>(null);
  const { connectEVMWallet, provider, signer, account, walletConnected } = useConnectEVMWallet();  /// @dev - Connect to an EVM wallet (i.e. MetaMask)
  const { onGetNativeTokenBalance, nativeTokenBalance } = useGetBalance();
  const { onReceiveHealthData, status, eventData, txHash, error } = useReceiveHealthData();
  const { onGetAvailableAttestationIds, availableAttestationIds } = useGetAvailableAttestationIds();
  const [fetchedAvailableAttestationIds, setFetchedAvailableAttestationIds] = useState<string | null>(null);


  /////////////////////////////////////////////////////////////
  /// Input form
  /////////////////////////////////////////////////////////////
  const [inputAttestationIdValue, setInputAttestationIdValue] = useState('');

  
  /////////////////////////////////////////////////////////////
  /// zkVerify
  /////////////////////////////////////////////////////////////
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  //const handleSubmit = async () => {
    if (!account) {
      setVerificationResult('Please connect a EVM wallet.');
      return;
    }

    setLoading(true);
    setVerificationResult(null);
    setBlockHash(null);

    /// @dev - Retrieve the input values from the input form
    event.preventDefault();
    console.log('Input AttestationId Value:', inputAttestationIdValue);

    /// @dev - Verify a ZK proof via zkVerify
    try {
      await onReceiveHealthData(
        provider, 
        signer, 
        account, /// @dev - walletAddress, which is also used for an argument of ZK circuit (main.nr)
        inputAttestationIdValue
      );
    } catch (error) {
      setVerificationResult(`Error: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGetNativeTokenBalance = async () => {
    try {
      await onGetNativeTokenBalance(provider, signer, account);
      console.log(`nativeTokenBalance: ${ nativeTokenBalance } EDU`);
    } catch (error) {
      setVerificationResult(`Error: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGetAvailableAttestationIds = async () => {
    try {
      await onGetAvailableAttestationIds(provider, signer, account);
      console.log(`availableAttestationIds: ${ availableAttestationIds }`);
      setFetchedAvailableAttestationIds(availableAttestationIds);
      console.log(`fetchedAvailableAttestationIds: ${ fetchedAvailableAttestationIds }`);
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
      connectEVMWallet(); /// @dev - Connetct an EVM wallet (i.e. MetaMask)
    }

    if (!nativeTokenBalance) {
      const fetchAttestationIds = async () => {
        try {  
          await onGetNativeTokenBalance(provider, signer, account); /// @dev - Get $EDU balance of a given account
        } catch (error) {
          console.error('Error fetching $EDU balance of a given account:', error);
        }
      };
    }
  
    if (!availableAttestationIds) {
      const fetchAttestationIds = async () => {
        try {  
          await onGetAvailableAttestationIds(provider, signer, account); /// @dev - Get availableAttestationIds
          console.log(`availableAttestationIds: ${ availableAttestationIds }`);
          setFetchedAvailableAttestationIds(availableAttestationIds);
          console.log(`fetchedAvailableAttestationIds: ${ fetchedAvailableAttestationIds }`);
        } catch (error) {
          console.error('Error fetching attestation IDs:', error);
        }
      };
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
 
          <br />

          <h1>Medical Researcher Page</h1>
          <Link href="/">
            Go to the HealthData Provider Page
          </Link>

          {/* <br /> */}

          {/* <h4>Deposit</h4> */}

          {/*
          <button
                type="submit"
                //onClick={handleSubmit}
                className={`button ${styles.verifyButton}`}
                disabled={!account || loading}
            >
              {loading ? (
                  <>
                    Submitting...
                    <div className="spinner"></div>
                  </>
              ) : (
                  'Deposit the Entrance Fee'
              )}
          </button>
          */}

          <br />

          <ConnectEVMWalletButton />

          <h4>$EDU balance of account: { nativeTokenBalance } EDU</h4>

          <button
              onClick={handleGetNativeTokenBalance}
              className={`button ${styles.verifyButton}`}
          >
            Get $EDU balance of account
          </button>

          <br />

          <hr />

          <br />

          <h4>Available (= Buyable) Attestation IDs</h4> 
          
          <button
              onClick={handleGetAvailableAttestationIds}
              className={`button ${styles.verifyButton}`}
          >
            Get Available Attestation IDs
          </button>

          <h4>Available Attestation IDs: { availableAttestationIds }</h4>
          <h4>Available Attestation IDs: { fetchedAvailableAttestationIds }</h4>

          <div className={styles.resultContainer}>
            {availableAttestationIds && (
                <p
                    className={
                      availableAttestationIds.includes('failed') ||
                      availableAttestationIds.includes('Error') ||
                      availableAttestationIds.includes('Rejected')
                          ? styles.resultError
                          : styles.resultSuccess
                    }
                >
                  {availableAttestationIds}
                </p>
            )} 
          </div>

          <br />

          <form onSubmit={handleSubmit}>
            <h4>Attestation ID</h4>
            <input
              type="text"
              value={inputAttestationIdValue}
              onChange={(e) => setInputAttestationIdValue(e.target.value)}
            />

            <br />

            <button
                type="submit"
                //onClick={handleSubmit}
                className={`button ${styles.verifyButton}`}
                disabled={!account || loading}
            >
              {loading ? (
                  <>
                    Submitting...
                    <div className="spinner"></div>
                  </>
              ) : (
                  'Receive Attested-Health Data'
              )}
            </button>
          </form>

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

            {/* 
            {transactionResult && (
                <div className={styles.transactionDetails}>
                  <p>Transaction Hash: {transactionResult.txHash || 'N/A'}</p>
                  <p>Proof Type: {transactionResult.proofType || 'N/A'}</p>
                  <p>Attestation ID: {transactionResult.attestationId || 'N/A'}</p>
                </div>
            )} 
            */}

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
