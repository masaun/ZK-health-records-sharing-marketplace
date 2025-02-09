'use client';
import { useState, useRef, useEffect } from 'react';
import { useAccount } from '@/context/AccountContext';
import ConnectWalletButton, { ConnectWalletButtonHandle } from '../components/ConnectWalletButton';
import ConnectEVMWalletButton from '../components/ConnectEVMWalletButton';
import { useConnectEVMWallet } from '@/hooks/useConnectEVMWallet';
import { useZkVerify } from '@/hooks/useZkVerify';
import { proverWithNoirJS } from '@/hooks/proverWithNoirJS';
import styles from './page.module.css';
//import proofData from '../proofs/risc0_v1_0.json';   /// @dev - For a Groth16 proof of RISC Zero
//import proofData from '../proofs/ultraplonk.json';   /// @dev - For a UltraPlonk proof of Noir
//import proofData from '../proofs/ultraplonk_with-foundry.json';  /// @dev - For a UltraPlonk proof of Noir
//import proofData from '../proofs/ultraplonk_zkv.json';  /// @dev - For a UltraPlonk proof of Noir
import proofData from '../../../circuits/zkVerify/final-output/ultraplonk_health_data_sharing_zkv.json';  /// @dev - For a UltraPlonk proof of Noir
import Image from 'next/image';
import Link from 'next/link';

import { ethers, BrowserProvider, Contract } from 'ethers';


export default function Home() {
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<string | null>(null);
  const [blockHash, setBlockHash] = useState<string | null>(null);
  const walletButtonRef = useRef<ConnectWalletButtonHandle | null>(null);
  const { selectedAccount, selectedWallet } = useAccount();
  const { connectEVMWallet, provider, signer, account, walletConnected } = useConnectEVMWallet();  /// @dev - Connect to an EVM wallet (i.e. MetaMask)
  const { onGenerateProof, proof } = proverWithNoirJS();
  const { onVerifyProof, status, eventData, transactionResult, merkleProofDetails, txHash, error } = useZkVerify(); 
  //const { onVerifyProof, status, eventData, transactionResult, error } = useZkVerify(); 

  /////////////////////////////////////////////////////////////
  /// Input form
  /////////////////////////////////////////////////////////////
  const [inputProductIdValue, setInputProductIdValue] = useState('');
  const [inputProviderIdValue, setInputProviderIdValue] = useState('');
  const [inputNameValue, setInputNameValue] = useState('');
  const [inputHeightValue, setInputHeightValue] = useState('');
  const [inputWeightValue, setInputWeightValue] = useState('');
  const [inputAgeValue, setInputAgeValue] = useState('');
  const [inputGenderValue, setInputGenderValue] = useState('');
  const [inputRaceTypeValue, setInputRaceTypeValue] = useState('');
  const [inputBloodTypeValue, setInputBloodTypeValue] = useState('');
  const [inputBloodPressureValue, setInputBloodPressureValue] = useState('');
  const [inputHeartRateValue, setInputHeartRateValue] = useState('');
  const [inputAverageHoursOfSleepValue, setInputAverageHoursOfSleepValue] = useState('');
  
  /// @dev - Below are "Selective Disclose" (NOTE: isCheckedRevealProductId is not needed)
  const [isCheckedRevealProviderId, setIsCheckedRevealProviderId] = useState(false);
  const [isCheckedRevealName, setIsCheckedRevealName] = useState(false);
  const [isCheckedRevealWalletAddress, setIsCheckedRevealWalletAddress] = useState(false);
  const [isCheckedRevealAge, setIsCheckedRevealAge] = useState(false);
  const [isCheckedRevealGender, setIsCheckedRevealGender] = useState(false);
  const [isCheckedRevealHeight, setIsCheckedRevealHeight] = useState(false);
  const [isCheckedRevealWeight, setIsCheckedRevealWeight] = useState(false);
  const [isCheckedRevealRaceType, setIsCheckedRevealRaceType] = useState(false);
  const [isCheckedRevealBloodType, setIsCheckedRevealBloodType] = useState(false);
  const [isCheckedRevealBloodPressure, setIsCheckedRevealBloodPressure] = useState(false);
  const [isCheckedRevealHeartRate, setIsCheckedRevealHeartRate] = useState(false);
  const [isCheckedRevealAverageHoursOfSleep, setIsCheckedRevealAverageHoursOfSleep] = useState(false); 

  /////////////////////////////////////////////////////////////
  /// zkVerify
  /////////////////////////////////////////////////////////////
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  //const handleSubmit = async () => {
    if (!selectedAccount || !selectedWallet) {
      setVerificationResult('Please connect a wallet and select an account.');
      return;
    }

    setLoading(true);
    setVerificationResult(null);
    setBlockHash(null);

    const { vk, publicSignals, proof } = proofData;
    //console.log(`vk, publicSignals, proof from the proofData: ${vk}, ${publicSignals}, ${proof}`);

    /// @dev - Retrieve the input values from the input form
    event.preventDefault();
    console.log('Input ProductId Value:', inputProductIdValue);
    console.log('Input ProviderId Value:', inputProviderIdValue);
    console.log('Input Name Value:', inputNameValue);
    console.log('Is Provider ID checked?:', isCheckedRevealProviderId);
    console.log('Is Name checked?:', isCheckedRevealName);
    console.log('Is WalletAddress checked?:', isCheckedRevealWalletAddress);
    console.log('Is Age checked?:', isCheckedRevealAge);
    console.log('Is Gender checked?:', isCheckedRevealGender);

    /// @dev - Generate a ZK proof via NoirJS
    try {
      await onGenerateProof();
    } catch (error) {
      setVerificationResult(`Error: ${(error as Error).message}`);
    } finally { 
      setLoading(false);
    }

    /// @dev - Verify a ZK proof via zkVerify
    try {
      //await onVerifyProof(provider, signer, account, proof, publicSignals, vk); /// @dev - useZkVerify.ts + Web3 Provider
      await onVerifyProof(
        proof, 
        publicSignals, 
        vk,
        provider, 
        signer, 
        account, /// @dev - walletAddress, which is also used for an argument of ZK circuit (main.nr)
        inputProductIdValue,
        inputProviderIdValue,
        inputNameValue,
        inputHeightValue,
        inputWeightValue,
        inputAgeValue,
        inputGenderValue,
        inputRaceTypeValue,
        inputBloodTypeValue,
        inputBloodPressureValue,
        inputHeartRateValue,
        inputAverageHoursOfSleepValue,
        /// @dev - Below are "Selective Disclose" (NOTE: isCheckedRevealProductId is not needed)
        isCheckedRevealProviderId,
        isCheckedRevealName,
        isCheckedRevealWalletAddress,
        isCheckedRevealAge,
        isCheckedRevealGender,
        isCheckedRevealHeight,
        isCheckedRevealWeight,
        isCheckedRevealRaceType,
        isCheckedRevealBloodType,
        isCheckedRevealBloodPressure,
        isCheckedRevealHeartRate,
        isCheckedRevealAverageHoursOfSleep
      );
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

          <h1>HealthData Provider Page</h1>
          <Link href="/medicalResearcherPage">
            Go to the MedicalResearcherPage
          </Link>

          <br />

          <Link href="/about">
            Go to the About Page
          </Link>

          <br />

          <ConnectWalletButton ref={walletButtonRef} onWalletConnected={() => {}} />
          
          <br></br>

          <ConnectEVMWalletButton />

          <br></br>

          <form onSubmit={handleSubmit}>
            <h4>Product ID</h4>
            <input
              type="text"
              value={inputProductIdValue}
              onChange={(e) => setInputProductIdValue(e.target.value)}
            />

            <br></br>

            <h4>Provider ID</h4>
            <input
              type="text"
              value={inputProviderIdValue}
              onChange={(e) => setInputProviderIdValue(e.target.value)}
            />

            <h4>Is Provider ID Revealed?</h4>
            <input
              type="checkbox"
              checked={isCheckedRevealProviderId}
              onChange={(e) => setIsCheckedRevealProviderId(e.target.checked)}
            />

            <br></br>

            <h4>Name</h4>
            <input
              type="text"
              value={inputNameValue}
              onChange={(e) => setInputNameValue(e.target.value)}
            />

            <h4>Is Name Revealed?</h4>
            <input
              type="checkbox"
              checked={isCheckedRevealName}
              onChange={(e) => setIsCheckedRevealName(e.target.checked)}
            />

            <br></br>

            <h4>Height</h4>
            <input
              type="text"
              value={inputHeightValue}
              onChange={(e) => setInputHeightValue(e.target.value)}
            />
            
            <h4>Is Height Revealed?</h4>
            <input
              type="checkbox"
              checked={isCheckedRevealHeight}
              onChange={(e) => setIsCheckedRevealHeight(e.target.checked)}
            />

            <br></br>

            <h4>Weight</h4>
            <input
              type="text"
              value={inputWeightValue}
              onChange={(e) => setInputWeightValue(e.target.value)}
            />

            <h4>Is Weight Revealed?</h4>
            <input
              type="checkbox"
              checked={isCheckedRevealWeight}
              onChange={(e) => setIsCheckedRevealWeight(e.target.checked)}
            />

            <br></br>

            <h4>Age</h4>
            <input
              type="text"
              value={inputAgeValue}
              onChange={(e) => setInputAgeValue(e.target.value)}
            />

            <h4>Is Age Revealed?</h4>
            <input
              type="checkbox"
              checked={isCheckedRevealAge}
              onChange={(e) => setIsCheckedRevealAge(e.target.checked)}
            />

            <br></br>

            <h4>Gender</h4>
            <input
              type="text"
              value={inputGenderValue}
              onChange={(e) => setInputGenderValue(e.target.value)}
            />

            <h4>Is Gender Revealed?</h4>
            <input
              type="checkbox"
              checked={isCheckedRevealGender}
              onChange={(e) => setIsCheckedRevealGender(e.target.checked)}
            />

            <br></br>

            <h4>Race Type</h4>
            <input
              type="text"
              value={inputRaceTypeValue}
              onChange={(e) => setInputRaceTypeValue(e.target.value)}
            />

            <h4>Is Race Type Revealed?</h4>
            <input
              type="checkbox"
              checked={isCheckedRevealRaceType}
              onChange={(e) => setIsCheckedRevealRaceType(e.target.checked)}
            />

            <br></br>

            <h4>Blood Type</h4>
            <input
              type="text"
              value={inputBloodTypeValue}
              onChange={(e) => setInputBloodTypeValue(e.target.value)}
            />

            <h4>Is Blood Type Revealed?</h4>
            <input
              type="checkbox"
              checked={isCheckedRevealBloodType}
              onChange={(e) => setIsCheckedRevealBloodType(e.target.checked)}
            />

            <br></br>

            <h4>Blood Pressure</h4>
            <input
              type="text"
              value={inputBloodPressureValue}
              onChange={(e) => setInputBloodPressureValue(e.target.value)}
            />

            <h4>Is Blood Pressure Revealed?</h4>
            <input
              type="checkbox"
              checked={isCheckedRevealBloodPressure}
              onChange={(e) => setIsCheckedRevealBloodPressure(e.target.checked)}
            />

            <br></br>

            <h4>Heart Rate</h4>
            <input
              type="text"
              value={inputHeartRateValue}
              onChange={(e) => setInputHeartRateValue(e.target.value)}
            />

            <h4>Is Heart Rate Revealed?</h4>
            <input
              type="checkbox"
              checked={isCheckedRevealHeartRate}
              onChange={(e) => setIsCheckedRevealHeartRate(e.target.checked)}
            />

            <br></br>

            <h4>Average Hours Of Sleep</h4>
            <input
              type="text"
              value={inputAverageHoursOfSleepValue}
              onChange={(e) => setInputAverageHoursOfSleepValue(e.target.value)}
            />

            <h4>Is Average Hours Of Sleep Revealed?</h4>
            <input
              type="checkbox"
              checked={isCheckedRevealAverageHoursOfSleep}
              onChange={(e) => setIsCheckedRevealAverageHoursOfSleep(e.target.checked)}
            />

            <br></br>

            <button
                type="submit"
                //onClick={handleSubmit}
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
          </form>

          {/* 
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
          */}

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
                  <p>Merkle Proof: {merkleProofDetails.proof || 'N/A'}</p>
                  <p>Number Of Leaves: {merkleProofDetails.numberOfLeaves || 'N/A'}</p>
                  <p>Leaf Index: {merkleProofDetails.leafIndex || 'N/A'}</p>
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
