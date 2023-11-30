import { ReactNode } from "react";
import { Polygon } from "./chainLogos";

export interface Chain {
    chainId: number;
    name: string;
    //logo: string;
    logo: ReactNode;
}

interface Chains {
    [key: string]: Chain;
}

export const chainsList: Chain[] = [
    {
        chainId: 80001,
        name: 'Mumbai Testnet',
        logo: <Polygon testnet />
    },
    {
        chainId: 137,
        name: 'Polygon Mainnet',
        logo: <Polygon />
    }
];

export const chains: Chains = {
    mumbai: chainsList[0],
    polygon: chainsList[1]
}

export const chainsById: Chains = {
    80001: chainsList[0],
    137: chainsList[1]
}