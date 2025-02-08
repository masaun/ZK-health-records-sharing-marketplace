import { useState, useEffect, useRef } from 'react';
import { useAccount } from '@/context/AccountContext';

import { compile, createFileManager } from "@noir-lang/noir_wasm"
import main from "../../../circuits/src/main.nr";
import nargoToml from "../../../circuits/Nargo.toml";


/**
 * This hook is used to prove (generate) a ZK proof using NoirJS
 */
export function proverWithNoirJS() {
    const { selectedAccount, selectedWallet } = useAccount();
    const [proof, setProof] = useState<string | null>(null);
    
    const onGenerateProof = async (): Promise<void> => {
        try {
            // TODO: Implement the proof generation logic here

        } catch (error) {
            console.error(error);
        }
    }
    
    return { proof, onGenerateProof };
}