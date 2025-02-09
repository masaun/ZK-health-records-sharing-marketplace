'use client';
import { useState, useRef, useEffect } from 'react';
//import { useAccount } from '../src/context/AccountContext';
import ConnectWalletButton, { ConnectWalletButtonHandle } from '../src/components/ConnectWalletButton';
import ConnectEVMWalletButton from '../src/components/ConnectEVMWalletButton';
import { useConnectEVMWallet } from '../src/hooks/useConnectEVMWallet';
import { useFunctionForMedicalResercher } from '../src/hooks/useFunctionForMedicalResercher';
import styles from '../src/app/page.module.css';
import Image from 'next/image';
import Link from 'next/link';

import { ethers, BrowserProvider, Contract } from 'ethers';


export default function MedicalResearcherPage() {
  // const [loading, setLoading] = useState(false);
  // const [verificationResult, setVerificationResult] = useState<string | null>(null);
  // const [blockHash, setBlockHash] = useState<string | null>(null);
  // const walletButtonRef = useRef<ConnectWalletButtonHandle | null>(null);
  // //const { selectedAccount, selectedWallet } = useAccount();
  // const { connectEVMWallet, provider, signer, account, walletConnected } = useConnectEVMWallet();  /// @dev - Connect to an EVM wallet (i.e. MetaMask)
  // const { onGenerateProof, proof } = proverWithNoirJS();
  // const { onVerifyProof, status, eventData, transactionResult, merkleProofDetails, txHash, error } = useZkVerify(); 
  // //const { onVerifyProof, status, eventData, transactionResult, error } = useZkVerify(); 

  // /////////////////////////////////////////////////////////////
  // /// Input form
  // /////////////////////////////////////////////////////////////
  // const [inputProductIdValue, setInputProductIdValue] = useState('');
  // const [inputProviderIdValue, setInputProviderIdValue] = useState('');
  // const [inputNameValue, setInputNameValue] = useState('');
  // const [inputHeightValue, setInputHeightValue] = useState('');
  // const [inputWeightValue, setInputWeightValue] = useState('');
  // const [inputAgeValue, setInputAgeValue] = useState('');
  // const [inputGenderValue, setInputGenderValue] = useState('');
  // const [inputRaceTypeValue, setInputRaceTypeValue] = useState('');
  // const [inputBloodTypeValue, setInputBloodTypeValue] = useState('');
  // const [inputBloodPressureValue, setInputBloodPressureValue] = useState('');
  // const [inputHeartRateValue, setInputHeartRateValue] = useState('');
  // const [inputAverageHoursOfSleepValue, setInputAverageHoursOfSleepValue] = useState('');
  
  // /// @dev - Below are "Selective Disclose" (NOTE: isCheckedRevealProductId is not needed)
  // const [isCheckedRevealProviderId, setIsCheckedRevealProviderId] = useState(false);
  // const [isCheckedRevealName, setIsCheckedRevealName] = useState(false);
  // const [isCheckedRevealWalletAddress, setIsCheckedRevealWalletAddress] = useState(false);
  // const [isCheckedRevealAge, setIsCheckedRevealAge] = useState(false);
  // const [isCheckedRevealGender, setIsCheckedRevealGender] = useState(false);
  // const [isCheckedRevealHeight, setIsCheckedRevealHeight] = useState(false);
  // const [isCheckedRevealWeight, setIsCheckedRevealWeight] = useState(false);
  // const [isCheckedRevealRaceType, setIsCheckedRevealRaceType] = useState(false);
  // const [isCheckedRevealBloodType, setIsCheckedRevealBloodType] = useState(false);
  // const [isCheckedRevealBloodPressure, setIsCheckedRevealBloodPressure] = useState(false);
  // const [isCheckedRevealHeartRate, setIsCheckedRevealHeartRate] = useState(false);
  // const [isCheckedRevealAverageHoursOfSleep, setIsCheckedRevealAverageHoursOfSleep] = useState(false); 

  // /////////////////////////////////////////////////////////////
  // /// zkVerify
  // /////////////////////////////////////////////////////////////
  // const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  // //const handleSubmit = async () => {
  //   if (!selectedAccount || !selectedWallet) {
  //     setVerificationResult('Please connect a wallet and select an account.');
  //     return;
  //   }

  //   setLoading(true);
  //   setVerificationResult(null);
  //   setBlockHash(null);

  //   const { vk, publicSignals, proof } = proofData;
  //   //console.log(`vk, publicSignals, proof from the proofData: ${vk}, ${publicSignals}, ${proof}`);

  //   /// @dev - Retrieve the input values from the input form
  //   event.preventDefault();
  //   console.log('Input ProductId Value:', inputProductIdValue);
  //   console.log('Input ProviderId Value:', inputProviderIdValue);
  //   console.log('Input Name Value:', inputNameValue);
  //   console.log('Is Provider ID checked?:', isCheckedRevealProviderId);
  //   console.log('Is Name checked?:', isCheckedRevealName);
  //   console.log('Is WalletAddress checked?:', isCheckedRevealWalletAddress);
  //   console.log('Is Age checked?:', isCheckedRevealAge);
  //   console.log('Is Gender checked?:', isCheckedRevealGender);

  //   /// @dev - Generate a ZK proof via NoirJS
  //   try {
  //     await onGenerateProof();
  //   } catch (error) {
  //     setVerificationResult(`Error: ${(error as Error).message}`);
  //   } finally { 
  //     setLoading(false);
  //   }

  //   /// @dev - Verify a ZK proof via zkVerify
  //   try {
  //     //await onVerifyProof(provider, signer, account, proof, publicSignals, vk); /// @dev - useZkVerify.ts + Web3 Provider
  //     await onVerifyProof(
  //       proof, 
  //       publicSignals, 
  //       vk,
  //       provider, 
  //       signer, 
  //       account, /// @dev - walletAddress, which is also used for an argument of ZK circuit (main.nr)
  //       inputProductIdValue,
  //       inputProviderIdValue,
  //       inputNameValue,
  //       inputHeightValue,
  //       inputWeightValue,
  //       inputAgeValue,
  //       inputGenderValue,
  //       inputRaceTypeValue,
  //       inputBloodTypeValue,
  //       inputBloodPressureValue,
  //       inputHeartRateValue,
  //       inputAverageHoursOfSleepValue,
  //       /// @dev - Below are "Selective Disclose" (NOTE: isCheckedRevealProductId is not needed)
  //       isCheckedRevealProviderId,
  //       isCheckedRevealName,
  //       isCheckedRevealWalletAddress,
  //       isCheckedRevealAge,
  //       isCheckedRevealGender,
  //       isCheckedRevealHeight,
  //       isCheckedRevealWeight,
  //       isCheckedRevealRaceType,
  //       isCheckedRevealBloodType,
  //       isCheckedRevealBloodPressure,
  //       isCheckedRevealHeartRate,
  //       isCheckedRevealAverageHoursOfSleep
  //     );
  //   } catch (error) {
  //     setVerificationResult(`Error: ${(error as Error).message}`);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   if (error) {
  //     setVerificationResult(error);
  //   } else if (status === 'verified') {
  //     setVerificationResult('Proof verified successfully!');
  //     if (eventData?.blockHash) {
  //       setBlockHash(eventData.blockHash);
  //     }
  //   } else if (status === 'includedInBlock' && eventData) {
  //     setVerificationResult('Transaction Included In Block');
  //   } else if (status === 'cancelled') {
  //     setVerificationResult('Transaction Rejected By User.');
  //   }

  //   if (!walletConnected) {
  //     connectEVMWallet(); /// @dev - Connetct an EVM wallet (i.e. MetaMask)
  //   }

  // }, [error, status, eventData, walletConnected]);
  // //}, [error, status, eventData]);

  // const blockExplorerUrl = blockHash
  //     ? `https://testnet-explorer.zkverify.io/v0/block/${blockHash}`
  //     : null;

  return (
      <div className={styles.page}>
        <div className={styles.main}>
          <Image
               src="/zk_Verify_logo_full_black.png"
               alt="zkVerify Logo"
               width={450}
               height={150}
          />

          <h1>Medical Researcher Page</h1>
 
        </div>
      </div>
  );
}
