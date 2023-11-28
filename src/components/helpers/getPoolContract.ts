import { Abi, Address, getContract, GetContractReturnType, PublicClient, WalletClient } from "viem";
import { getPublicClient } from '@wagmi/core'
import poolABI from "../../utils/poolABI";

const getPoolContract = (poolAddress: string | undefined) => {
    const publicClient = getPublicClient(); 
    
    if (!poolAddress) {return}

    const contract = getContract({
        address: poolAddress as `0x${string}`,
        abi: poolABI,
        publicClient,
    }) as GetContractReturnType<Abi, PublicClient, WalletClient, Address>

    return contract;
}

export default getPoolContract;