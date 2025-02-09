import React from 'react';
import { useConnectEVMWallet } from '@/hooks/useConnectEVMWallet';
import styles from './ConnectEVMWalletButton.module.css';

const ConnectEVMWalletButton = () => {
  const { connectEVMWallet, provider, signer, account, walletConnected } = useConnectEVMWallet();  /// @dev - Connect to an EVM wallet (i.e. MetaMask)

  return (
    <div>
      <button 
        onClick={connectEVMWallet}
        className={`button ${styles.walletButton}`}
      >
        {account
                    ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}`
                    : 'Connect EVM Wallet'}
      </button>
      {/* {account && <p>Connected Wallet Address: {account}</p>} */}
    </div>
  );
};

export default ConnectEVMWalletButton;