import { getContract } from "viem";
import { getPublicClient } from '@wagmi/core'
import poolABI from "../../utils/poolABI";

const getPoolContract = (poolAddress: string | undefined) => {
    const publicClient = getPublicClient({ chainId: 80001 }); 
    
    if (!poolAddress) {return}

    const contract = getContract({
        address: poolAddress as `0x${string}`,
        abi: poolABI,
        publicClient,
    });

    return contract;
}

export default getPoolContract;