export interface Chain {
    chainId: number;
    name: string;
    logo: string;
}

interface Chains {
    [key: string]: Chain;
}

export const chainsList: Chain[] = [
    {
        chainId: 80001,
        name: 'Mumbai Testnet',
        logo: '/mumbai-logo.png'
    },
    {
        chainId: 137,
        name: 'Polygon Mainnet',
        logo: '/polygon-logo.png'
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