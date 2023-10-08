import { getContract } from "viem";
import { getPublicClient } from '@wagmi/core'

const getPoolContract = (poolAddress: string | undefined) => {
    const publicClient = getPublicClient({ chainId: 80001 }); 
    
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
        },
        {
            "inputs":[],
            "name":"getReserves",
            "outputs":[
                {
                    "internalType":"uint112",
                    "name":"reserve0",
                    "type":"uint112"
                },
                {
                    "internalType":"uint112",
                    "name":"reserve1",
                    "type":"uint112"
                },
                {
                    "internalType":"uint32",
                    "name":"time",
                    "type":"uint32"
                }
            ],
            "stateMutability":"view",
            "type":"function"
        },
        {
            "inputs":[],
            "name":"token0",
            "outputs":[
                {
                    "internalType":"contract ISuperToken",
                    "name":"",
                    "type":"address"
                }
            ],
            "stateMutability":"view",
            "type":"function"
        },
        {
            "inputs":[],
            "name":"token1",
            "outputs":[
                {
                    "internalType":"contract ISuperToken",
                    "name":"",
                    "type":"address"
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

export default getPoolContract;