import getChainId from "../components/helpers/getChainId";
import { TokenTypes } from "../types/TokenOption";

export const whitelistedTokens = [
    {
        name: "USD Coin",
        address: "0x42bb40bF79730451B11f6De1CbA222F17b87Afd7" as `0x${string}`,
        symbol: "USDCx",
        decimals: 18,
        underlyingToken: {
            name: "USD Coin",
            address: "0xbe49ac1EadAc65dccf204D4Df81d650B50122aB2" as `0x${string}`,
            symbol: "USDC",
            decimals: 18,
            logoURI: "/usdc-logo.png",
        },
        logoURI: "/usdc-logo.png",
        refUSDCxPoolAddress: "0xb7b2dc80e7eb6323c6e46294b7d066f72f7c19cc"
    },
    {
        name: "DAI Stablecoin",
        address: "0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f" as `0x${string}`,
        symbol: "DAIx",
        decimals: 18,
        underlyingToken: {
            name: "DAI Stablecoin",
            address: "0x15F0Ca26781C3852f8166eD2ebce5D18265cceb7" as `0x${string}`,
            symbol: "DAI",
            decimals: 18,
            logoURI: "/dai-logo.png",
        },
        logoURI: "/dai-logo.png",
        refUSDCxPoolAddress: "0xb7b2dc80e7eb6323c6e46294b7d066f72f7c19cc"
    },
];

interface MapAddressToToken {
    [key: string]: TokenTypes;
}

interface MapChainToAddresses {
    [key: string]: MapAddressToToken;
}

const mapChainToAddressToToken: MapChainToAddresses = {
    5: { //goerli

    },
    80001: { //mumbai
        "0x42bb40bF79730451B11f6De1CbA222F17b87Afd7": whitelistedTokens[0],
        "0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f": whitelistedTokens[1],
    }
}

export function findToken(address: string): TokenTypes | undefined {
    const chainId = getChainId();
    if (!chainId) { return; }

    return mapChainToAddressToToken[chainId][address];
}