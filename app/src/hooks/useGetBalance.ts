// filepath: /Users/unomasanori/Projects/DEMO_MVP/【Noir】Desci Mania at Zo (Jan 1–31, 2025)/ZK-health-records-sharing/app/src/hooks/useReceiveHealthData.ts
import { useState } from 'react';
import { ethers } from 'ethers';

export function useGetBalance() {
  const [status, setStatus] = useState<string | null>(null);
  const [eventData, setEventData] = useState<any>(null);
  const [txHash, setTxHash] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [nativeTokenBalance, setNativeTokenBalance] = useState<string | null>(null);

  const onGetNativeTokenBalance = async (
    provider: ethers.JsonRpcProvider, // Browser Provider, which is retrieved via ethers.js v6
    signer: ethers.Signer, // Browser Signer, which is retrieved via ethers.js v6
    account: string // This is also used as a "walletAddress"
  ): Promise<void> => {
    try {
      console.log(`provider: ${JSON.stringify(provider, null, 4)}`);
      console.log(`signer: ${JSON.stringify(signer, null, 4)}`);
      console.log(`account: ${account}`);

      if (!account) {
        throw new Error('EVM Wallet is not selected');
      }

      // Get the balance of the account
      const balanceBigInt = await provider.getBalance(account);
      const balanceNativeToken = ethers.formatEther(balanceBigInt);
      setNativeTokenBalance(nativeTokenBalance);

      console.log(`$EDU Balance: ${nativeTokenBalance} EDU`);

      // Add your contract interaction logic here

    } catch (error) {
      console.error('Error:', error);
      setError((error as Error).message);
    }
  };

  return { nativeTokenBalance, onGetNativeTokenBalance };
}