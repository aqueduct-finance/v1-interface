import { getContract } from "viem";
import { usePublicClient } from "wagmi";
import { cfaV1 } from "../../utils/constants";

const useCFA = () => {
    const cfaABI = [{
        "inputs":[
            {
                "internalType":"contract ISuperfluidToken",
                "name":"token",
                "type":"address"
            },
            {
                "internalType":"address",
                "name":"sender",
                "type":"address"
            },
            {
                "internalType":"address",
                "name":"receiver",
                "type":"address"
            }
        ],
        "name":"getFlow",
        "outputs":[
            {
                "internalType":"uint256",
                "name":"timestamp",
                "type":"uint256"
            },
            {
                "internalType":"int96",
                "name":"flowRate",
                "type":"int96"
            },
            {
                "internalType":"uint256",
                "name":"deposit",
                "type":"uint256"
            },
            {
                "internalType":"uint256",
                "name":"owedDeposit",
                "type":"uint256"
            }
        ],
        "stateMutability":"view",
        "type":"function"
    }];

    const publicClient = usePublicClient({ chainId: 80001 });
    const contract = getContract({
        address: cfaV1,
        abi: cfaABI,
        publicClient,
    });

    return contract;
}

export default useCFA;