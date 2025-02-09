import { useState, useEffect } from 'react';
import { ethers, providers, Contract } from 'ethers';


/**
 * @notice - This hook is used to connect to an EVM wallet.
 */
export function useConnectEVMWallet() {
    const [provider, setProvider] = useState();
    const [signer, setSigner] = useState();
    const [account, setAccount] = useState();
    const [walletConnected, setWalletConnected] = useState<boolean>(false); // walletConnected keep track of whether the user's wallet (i.e. MetaMask) is connected or not

    const connectEVMWallet = async () => {
        // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
        if (typeof window !== "undefined") {
        let browserSigner = null;
        let browserProvider = null;
        let browserAccount = null;
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

    return { connectEVMWallet, provider, signer, account, walletConnected };    
}
