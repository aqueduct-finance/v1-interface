import { Abi, Address, getContract, GetContractReturnType, PublicClient, WalletClient } from "viem";
import { getWalletClient } from '@wagmi/core'
import poolABI from "../../utils/poolABI";

const getWriteablePoolContract = async (poolAddress: string | undefined) => {
    let walletClient
    while (!walletClient) {
        walletClient = (await getWalletClient({ chainId: 80001 })) as WalletClient; 
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