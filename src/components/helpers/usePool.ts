import { getContract } from "viem";
import { usePublicClient } from "wagmi";

const usePool = (poolAddress: string | undefined) => {
    const publicClient = usePublicClient({ chainId: 80001 });
    
    if (!poolAddress) {return}

    const poolABI = [
        {
            "inputs":[
                {
                    "internalType":"address",
                    "name":"user",
                    "type":"address"
                },
                {
                    "internalType":"uint32",
                    "name":"time",
                    "type":"uint32"
                }
            ],
            "name":"getUserBalancesAtTime",
            "outputs":[
                {
                    "internalType":"uint",
                    "name":"balance0",
                    "type":"uint"
                },
                {
                    "internalType":"uint",
                    "name":"balance1",
                    "type":"uint"
                }
            ],
            "stateMutability":"view",
            "type":"function"
        },
        {
            "inputs":[
                {
                    "internalType":"uint32",
                    "name":"time",
                    "type":"uint32"
                }
            ],
            "name":"getReservesAtTime",
            "outputs":[
                {
                    "internalType":"uint112",
                    "name":"_reserve0",
                    "type":"uint112"
                },
                {
                    "internalType":"uint112",
                    "name":"_reserve1",
                    "type":"uint112"
                }
            ],
            "stateMutability":"view",
            "type":"function"
        }
    ]

    const contract = getContract({
        address: poolAddress as `0x${string}`,
        abi: poolABI,
        publicClient,
    });

    return contract;
}

export default usePool;