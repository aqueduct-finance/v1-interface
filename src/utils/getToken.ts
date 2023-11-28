import { Framework } from "@superfluid-finance/sdk-core";
import { ethers } from "ethers";
import { TokenTypes } from "../types/TokenOption";
import { findToken } from "./whitelistedTokens";
import getChainId from "../components/helpers/getChainId";

interface GetTokenArgs {
    tokenAddress: string;
    provider: ethers.providers.Provider;
    chainId: number;
}

const getToken = async ({
    tokenAddress,
    provider
}: GetTokenArgs): Promise<TokenTypes> => {
    const token = findToken(tokenAddress);
    if (token) {
        return token;
    }

    const chainId = getChainId();
    if (!chainId) { 
        return {
            name: "undefined",
            symbol: "undefined",
            logoURI: "",
            address: tokenAddress as `0x${string}`,
            decimals: 18,
            chainId: chainId,
        };
    }

    // if didn't find listed token, create object for unlisted token
    const sf = await Framework.create({
        chainId,
        provider,
    });
    const superToken = await sf.loadSuperToken(tokenAddress);
    const tokenName = await superToken.name({ providerOrSigner: provider });

    return {
        name: tokenName,
        symbol: "undefined",
        logoURI: "",
        address: tokenAddress as `0x${string}`,
        decimals: 18,
        chainId: chainId,
    };

    // TODO: Do we need error handling here?
};

export default getToken;
