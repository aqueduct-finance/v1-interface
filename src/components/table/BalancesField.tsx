import { BigNumber, ethers } from "ethers";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useEthersProvider } from "../providers/provider";
import { TokenTypes } from "../../types/TokenOption";
import useSuperToken from "../helpers/useSuperToken";
import { decodeRealTimeBalanceRes } from "../helpers/decodeRealTimeBalanceRes";

const ANIMATION_MINIMUM_STEP_TIME = 100;
const REFRESH_INTERVAL = 300; // 300 * 100 = 30000 ms = 30 s

interface BalancesFieldProps {
    token0: TokenTypes;
    token1: TokenTypes;
}

function BalancesField({ token0, token1 }: BalancesFieldProps) {
    const [currentBalance0, setCurrentBalance0] = useState<BigNumber>(
        ethers.BigNumber.from(0)
    );
    const [flowRate0, setFlowRate0] = useState<BigNumber>(
        ethers.BigNumber.from(0)
    );
    const [currentBalance1, setCurrentBalance1] = useState<BigNumber>(
        ethers.BigNumber.from(0)
    );
    const [flowRate1, setFlowRate1] = useState<BigNumber>(
        ethers.BigNumber.from(0)
    );
    const provider = useEthersProvider();
    const { address } = useAccount();
    const tokenContract0 = useSuperToken(token0.address);
    const tokenContract1 = useSuperToken(token1.address);

    const updateTokenPairRealTimeBalanceCallback = useCallback(() => {
        async function updateTokenPairRealTimeBalance() {
            if (address && tokenContract0 && tokenContract1) {
                // when switching chains, tokenContract0/1 can be defined, but will cause an error if the address is now incorrect
                // temp: just catch the error and wait for component to update
                try {
                    const currentTimestampBigNumber = ethers.BigNumber.from(
                        new Date().valueOf() // Milliseconds elapsed since UTC epoch, disregards timezone.
                    );
                    const currentTimestamp = currentTimestampBigNumber.div(1000).toString();
                    const futureTimestamp = currentTimestampBigNumber
                        .div(1000)
                        .add(
                            (REFRESH_INTERVAL *
                                ANIMATION_MINIMUM_STEP_TIME) /
                            1000
                        )
                        .toString();

                    // batch call: get present and future balance for both tokens
                    const [presentBal0, futureBal0, presentBal1, futureBal1] = await Promise.all([
                        tokenContract0.read.realtimeBalanceOf([address, currentTimestamp]),
                        tokenContract0.read.realtimeBalanceOf([address, futureTimestamp]),
                        tokenContract1.read.realtimeBalanceOf([address, currentTimestamp]),
                        tokenContract1.read.realtimeBalanceOf([address, futureTimestamp]),
                    ])

                    const decodedPresentBal0 = decodeRealTimeBalanceRes(presentBal0);
                    const decodedFutureBal0 = decodeRealTimeBalanceRes(futureBal0);
                    const decodedPresentBal1 = decodeRealTimeBalanceRes(presentBal1);
                    const decodedFutureBal1 = decodeRealTimeBalanceRes(futureBal1);

                    // set token0 state
                    const initialBalance0 = decodedPresentBal0.availableBalance;
                    const futureBalance0 = decodedFutureBal0.availableBalance;
                    setCurrentBalance0(initialBalance0);
                    setFlowRate0(
                        futureBalance0.sub(initialBalance0).div(REFRESH_INTERVAL)
                    );

                    // set token1 state
                    const initialBalance1 = decodedPresentBal1.availableBalance;
                    const futureBalance1 = decodedFutureBal1.availableBalance;
                    setCurrentBalance1(initialBalance1);
                    setFlowRate1(
                        futureBalance1.sub(initialBalance1).div(REFRESH_INTERVAL)
                    );
                } catch {}
            }
        }

        updateTokenPairRealTimeBalance();
    }, [address, provider, token0.address, token1.address]);

    // REFRESH(in milliseconds) = REFRESH_INTERVAL * ANIMATION_MINIMUM_STEP_TIME
    const [time, setTime] = useState(REFRESH_INTERVAL);
    useEffect(() => {
        const timer = setTimeout(() => {
            setTime(time + 1);
            if (time >= REFRESH_INTERVAL) {
                setTime(0);
                updateTokenPairRealTimeBalanceCallback();
            }

            // animate frame
            setCurrentBalance0((c) => c.add(flowRate0));
            setCurrentBalance1((c) => c.add(flowRate1));
        }, ANIMATION_MINIMUM_STEP_TIME);
        return () => {
            clearTimeout(timer);
        };
    }, [flowRate0, flowRate1, time, updateTokenPairRealTimeBalanceCallback]);

    useEffect(() => {
        updateTokenPairRealTimeBalanceCallback();
    }, [address, updateTokenPairRealTimeBalanceCallback]);

    return (
        <div className="flex items-center space-x-2 monospace-font text-sm mr-8 overflow-hidden">
            <p className="tracking-widest font-semibold">
                {parseFloat(
                    ethers.utils.formatEther(currentBalance0)
                ).toLocaleString(undefined, { minimumFractionDigits: 6 })}
            </p>
            <Image
                src={token0.logoURI}
                className="ml-1 mr-2"
                width="20"
                height="20"
                alt={token0.name}
            />
            <p className="tracking-widest font-semibold">
                {parseFloat(
                    ethers.utils.formatEther(currentBalance1)
                ).toLocaleString(undefined, { minimumFractionDigits: 6 })}
            </p>
            <Image
                src={token1.logoURI}
                className="ml-1"
                width="20"
                height="20"
                alt={token1.name}
            />
        </div>
    );
}

export default BalancesField;
