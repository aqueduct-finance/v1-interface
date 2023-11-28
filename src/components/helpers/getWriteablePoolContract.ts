import { Abi, Address, getContract, GetContractReturnType, PublicClient, WalletClient } from "viem";
import { getWalletClient } from '@wagmi/core'
import poolABI from "../../utils/poolABI";
import getChainId from "./getChainId";

const getWriteablePoolContract = async (poolAddress: string | undefined) => {
    let walletClient
    while (!walletClient) {
        const chainId = getChainId();
        if (chainId) {
            walletClient = (await getWalletClient({ chainId: chainId })) as WalletClient; 
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (!poolAddress) {return}

    const contract = getContract({
        address: poolAddress as `0x${string}`,
        abi: poolABI,
        walletClient: walletClient,
    }) as GetContractReturnType<Abi, PublicClient, WalletClient, Address>;

    return contract;
}

export default getWriteablePoolContract;