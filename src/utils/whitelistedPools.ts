import getChainId from "../components/helpers/getChainId";
import { constants, mumbaiChainId } from "./constants";

interface Pool {
    token0: string;
    token1: string;
    address: string;
}

interface WhitelistedPools {
    [key: string]: Pool[];
}

const whitelistedPools: WhitelistedPools = {
    5: [], // goerli
    80001: [ // mumbai
        {
            token0: constants[mumbaiChainId].fUSDCx,
            token1: constants[mumbaiChainId].fDAIx,
            address: '0xb7b2dc80e7eb6323c6e46294b7d066f72f7c19cc'
        }
    ]
};

export function getWhitelistedPools(chainId: number): Pool[] {
    return whitelistedPools[chainId];
}

export function getDefaultWhitelistedPools(): Pool[] | undefined {
    const chainId = getChainId();
    if (!chainId) { return; }

    return getWhitelistedPools(chainId);
}