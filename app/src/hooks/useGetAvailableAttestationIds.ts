import { useState, useEffect, useRef } from 'react';
import { useAccount } from '@/context/AccountContext';

import { ethers, providers, Contract } from 'ethers';
import { on } from 'events';


export function useGetAvailableAttestationIds() {
    const [status, setStatus] = useState<string | null>(null);
    const [availableAttestationIds, setAvailableAttestationIds] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const onGetAvailableAttestationIds = async (
        provider: any, /// Browser Provider, which is retrieved via ethers.js v6
        signer: any,   /// Browser Signer, which is retrieved via ethers.js v6
        account: any,        /// This is also used as a "walletAddress" 
    ): Promise<void> => {
        try {
            console.log(`provider: ${JSON.stringify(provider, null, 4)}`);
            console.log(`signer: ${JSON.stringify(signer, null, 4)}`);
            console.log(`account: ${account}`);

            setStatus('verifying');
            setError(null);

            /// @dev - ABI of the HealthDataSharingExecutor.sol
            const abiHealthDataSharingExecutorContract = [
                "function submitHealthData(bytes calldata proof, bytes32[] calldata publicInput, uint256 medicalResearcherId, uint256 healthDataSharingRequestId, uint256 _attestationId, bytes32 _leaf, bytes32[] calldata _merklePath, uint256 _leafCount, uint256 _index)",
                "function receiveHealthData(uint256 _attestationId)",
                "function getAvailableAttestationIds() public view returns(uint256[] memory _availableAttestationIds)"
            ];

            const healthDataSharingExecutorContract = new Contract(process.env.NEXT_PUBLIC_EDU_CHAIN_HEALTH_DATA_SHARING_EXECUTOR_CONTRACT_ADDRESS, abiHealthDataSharingExecutorContract, provider);
            const healthDataSharingExecutorContractWithSigner = healthDataSharingExecutorContract.connect(signer);
            
            console.log(`Hey!!!`);

            /// @dev - Call the HealthDataSharingRequester#receiveHealthData()
            try {
                const _fetchedAvailableAttestationIds = await healthDataSharingExecutorContract.getAvailableAttestationIds();
                setAvailableAttestationIds(_fetchedAvailableAttestationIds);
                console.log(`availableAttestationIds on EDU Chain (Testnet): ${_fetchedAvailableAttestationIds}`);
            } catch (error) {
                console.error('Error fetching attestation IDs:', error);
            }
        } catch (error: unknown) {
            const errorMessage = (error as Error).message;
            setError(errorMessage);
            setStatus('error'); /// @dev - This message is shown on the bottom of left on the screen (UI).
        }
    };

    return { status, error, availableAttestationIds, onGetAvailableAttestationIds };
}


/**
 * @notice - Wait for "ms" mili seconds
 */
export const asyncTimeout = (ms: number) => {
    console.log("Waited 60s");
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};
