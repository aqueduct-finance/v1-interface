import { getContract } from "viem";
import { getPublicClient } from '@wagmi/core'
import { getDefaultAddresses } from "../../utils/constants";
import getChainId from "./getChainId";

const getFactoryContract = () => {
    
    const chainId = getChainId();
    if (!chainId) { return; }

    const publicClient = getPublicClient();   

    const address = getDefaultAddresses()?.aqueductFactory;
    if (!address) { return; }

    const abi = [
        {
            "inputs":[
                {
                    "internalType":"address",
                    "name":"",
                    "type":"address"
                },
                {
                    "internalType":"address",
                    "name":"","type":"address"
                }
            ],
            "name":"getPair",
            "outputs":[
                {
                    "internalType":"address",
                    "name":"",
                    "type":"address"
                }
            ],
            "stateMutability":"view",
            "type":"function"
        }
    ]

    const contract = getContract({
        address: address as `0x${string}`,
        abi: abi,
        publicClient
    });

    return contract;
}

export default getFactoryContract;