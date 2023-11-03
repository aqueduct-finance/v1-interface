import { Framework } from "@superfluid-finance/sdk-core";
import { ethers } from "ethers";
import { TokenTypes } from "../types/TokenOption";
import { findToken } from "./tokens";

interface GetTokenArgs {
    tokenAddress: string;
    provider: ethers.providers.Provider;
    chainId: number;
}

const getToken = async ({
    tokenAddress,
    provider,
    chainId,
}: GetTokenArgs): Promise<TokenTypes> => {
    const token = findToken(tokenAddress);
    if (token) {
        return token;
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
        chainId: 5,
    };

    // TODO: Do we need error handling here?
};

export default getToken;
