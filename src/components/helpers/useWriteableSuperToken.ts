import { getContract, WalletClient } from "viem";
import { getWalletClient } from '@wagmi/core'
import { useEffect, useState } from "react";

const useWriteableSuperToken = (tokenAddress: string | undefined) => {
    const [contract, setContract] = useState();
    const [walletClient, setWalletClient] = useState<WalletClient>();

    useEffect(() => {
        let isMounted = true;

        const fetchWalletClient = async () => {
            while (!walletClient && isMounted) {
                const client = (await getWalletClient({ chainId: 80001 })) as WalletClient;
                if (isMounted) {
                    setWalletClient(client);
                }
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        };

        if (tokenAddress) {
            fetchWalletClient();
        }

        return () => {
            isMounted = false;
        };
    }, [tokenAddress, walletClient]);

    useEffect(() => {
        if (walletClient && tokenAddress) {
            const superTokenABI = [
                {
                    "inputs": [
                        {
                            "internalType": "uint256",
                            "name": "amount",
                            "type": "uint256"
                        }
                    ],
                    "name": "downgrade",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                }
            ];

            const newContract = getContract({
                address: tokenAddress as `0x${string}`,
                abi: superTokenABI,
                walletClient,
            });

            setContract(newContract);
        }
    }, [walletClient, tokenAddress]);

    return contract;
};

export default useWriteableSuperToken;