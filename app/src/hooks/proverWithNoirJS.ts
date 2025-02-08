import { useState, useEffect, useRef } from 'react';
import { useAccount } from '@/context/AccountContext';

import { compile, createFileManager } from "@noir-lang/noir_wasm"
import main from "../../../circuits/src/main.nr";
import nargoToml from "../../../circuits/Nargo.toml";


/**
 * @notice - This hook is used to prove (generate) a ZK proof using NoirJS
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


/**
 * @notice - Get the circuit from the ZK circuit in Noir
 */
export async function getCircuit() {
    const fm = createFileManager("/");
    const { body } = await fetch(main);
    const { body: nargoTomlBody } = await fetch(nargoToml);
   
    fm.writeFile("../../../circuits/src/main.nr", body);
    fm.writeFile("../../../circuits/Nargo.toml", nargoTomlBody);
    return await compile(fm);
}