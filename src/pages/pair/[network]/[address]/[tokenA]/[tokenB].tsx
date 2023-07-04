/* eslint-disable radix */
import type { NextPage } from "next";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { IoArrowBack, IoLogoTwitter } from "react-icons/io5";
import { BiLink } from "react-icons/bi";
import { RiCloseCircleFill, RiPencilFill } from "react-icons/ri";
import { BigNumber, ethers } from "ethers";
import { useAccount, useNetwork } from "wagmi";
import { Framework } from "@superfluid-finance/sdk-core";
import Operation from "@superfluid-finance/sdk-core/dist/module/Operation";
import { useEthersProvider } from "../../../../../components/providers/provider";
import { useEthersSigner } from "../../../../../components/providers/signer";
import { TokenTypes } from "../../../../../types/TokenOption";
import getPoolAddress from "../../../../../components/helpers/getPool";
import WidgetContainer from "../../../../../components/widgets/WidgetContainer";
import PageNotFound from "../../../../../components/PageNotFound";
import getTweetTemplate from "../../../../../utils/getTweetTemplate";
import getSharedLink from "../../../../../utils/getSharedLink";
import { useStore } from "../../../../../store";
import ButtonWithInfoPopup from "../../../../../components/ButtonInfoPopup";
import getToken from "../../../../../utils/getToken";
import LoadingSpinner from "../../../../../components/LoadingSpinner";
import SwapData from "../../../../../types/SwapData";
import { mumbaiChainId } from "../../../../../utils/constants";
import { showTransactionConfirmedToast } from "../../../../../components/Toasts";
import getErrorToast from "../../../../../utils/getErrorToast";
import TotalAmountsStreamedWidget from "../../../../../components/widgets/TotalAmountsStreamedWidget";
import PriceChart from "../../../../../components/streamview/PriceChart";
import { gql, useQuery } from "@apollo/client";
import { PriceHistory } from "../../../../../types/PriceHistory";

const ANIMATION_MINIMUM_STEP_TIME = 10;
const REFRESH_INTERVAL = 3000; // 300 * 100 = 30000 ms = 30 s

const PoolInteractionVisualization: NextPage = () => {
    // zustand
    const store = useStore();

    // wagmi
    const provider = useEthersProvider();
    const { chain } = useNetwork(); // TODO: use router param
    const { address } = useAccount();
    const signer = useEthersSigner()

    const [isDeleting, setIsDeleting] = useState(false);

    // component state
    const [isLoading, setIsLoading] = useState(true);
    const [positionFound, setPositionFound] = useState(false);

    // state for token0
    const [currentBalance0, setCurrentBalance0] = useState<BigNumber>(
        ethers.BigNumber.from(0)
    );
    const [flowRate0, setFlowRate0] = useState<BigNumber>(
        ethers.BigNumber.from(0)
    );
    const [currentTwapBalance0, setCurrentTwapBalance0] = useState<BigNumber>(
        ethers.BigNumber.from(0)
    );
    const [twapFlowRate0, setTwapFlowRate0] = useState<BigNumber>(
        ethers.BigNumber.from(0)
    );
    const [isTwap0, setIsTwap0] = useState<boolean>(false);

    // state for token1
    const [currentBalance1, setCurrentBalance1] = useState<BigNumber>(
        ethers.BigNumber.from(0)
    );
    const [flowRate1, setFlowRate1] = useState<BigNumber>(
        ethers.BigNumber.from(0)
    );
    const [currentTwapBalance1, setCurrentTwapBalance1] = useState<BigNumber>(
        ethers.BigNumber.from(0)
    );
    const [twapFlowRate1, setTwapFlowRate1] = useState<BigNumber>(
        ethers.BigNumber.from(0)
    );
    const [isTwap1, setIsTwap1] = useState<boolean>(false);

    // current and average price
    const [currentPrice, setCurrentPrice] = useState<number>(0);
    const [averagePrice, setAveragePrice] = useState<number>(0);

    // extra metadata
    const [startDate, setStartDate] = useState<Date>();

    // url params
    const router = useRouter();
    const [userAddress, setUserAddress] = useState<string>();
    const [token0, setToken0] = useState<TokenTypes>();
    const [token1, setToken1] = useState<TokenTypes>();
    useEffect(() => {
        if (
            typeof router.query.address !== "string" ||
            typeof router.query.tokenA !== "string" ||
            typeof router.query.tokenB !== "string"
        ) {
            setPositionFound(false);
            setIsLoading(false);
            return;
        }

        // get user wallet address
        setUserAddress(router.query.address);

        async function getTokens() {
            if (
                typeof router.query.tokenA === "string" &&
                typeof router.query.tokenB === "string"
            ) {
                const tokenA = await getToken({
                    tokenAddress: router.query.tokenA,
                    provider,
                    chainId: mumbaiChainId,
                });
                const tokenB = await getToken({
                    tokenAddress: router.query.tokenB,
                    provider,
                    chainId: mumbaiChainId,
                });

                if (!tokenA || !tokenB) {
                    setPositionFound(false);
                    setIsLoading(false);
                    return;
                }
                setToken0(tokenA);
                setToken1(tokenB);
            }
        }

        getTokens();
        // TODO: Assess missing dependency array values
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router.query]);

    // Refresh function called on interval
    // TODO: break this up into smaller functions
    async function updateVars() {
        const poolABI = [
            "function getUserBalancesAtTime(address user, uint32 time) public view returns (uint balance0, uint balance1)",
        ];
        if (!userAddress || !provider || !token0 || !token1) {
            return;
        }

        const sf = await Framework.create({
            chainId: mumbaiChainId,
            provider,
        });
        const poolAddress = getPoolAddress(token0.address, token1.address);
        const poolContract = new ethers.Contract(
            poolAddress,
            poolABI,
            provider
        );
        const currentTimestampBigNumber = ethers.BigNumber.from(
            new Date().valueOf() // Milliseconds elapsed since UTC epoch, disregards timezone.
        );

        async function getTokenProps({
            tokenAddress,
        }: {
            tokenAddress: string;
        }): Promise<{
            initialBalance: BigNumber;
            initialTwapBalance: BigNumber;
            flowRate: BigNumber;
            twapFlowRate: BigNumber;
            startDate: Date;
        }> {
            // get regular sf stream params
            const flowInfo = await sf.cfaV1.getFlow({
                superToken: tokenAddress,
                sender: userAddress || "",
                receiver: poolAddress,
                providerOrSigner: provider,
            });

            // calculate regular streaming balances
            let initialBalance: BigNumber = BigNumber.from(0);
            let futureBalance: BigNumber = BigNumber.from(0);
            if (BigNumber.from(flowInfo.flowRate).gt(0)) {
                // use regular sf stream params
                initialBalance = BigNumber.from(flowInfo.flowRate).mul(
                    currentTimestampBigNumber
                        .sub(
                            ethers.BigNumber.from(flowInfo.timestamp.valueOf())
                        )
                        .div(1000)
                );
                futureBalance = BigNumber.from(flowInfo.flowRate).mul(
                    currentTimestampBigNumber
                        .sub(
                            ethers.BigNumber.from(flowInfo.timestamp.valueOf())
                        )
                        .div(1000)
                        .add(
                            (REFRESH_INTERVAL * ANIMATION_MINIMUM_STEP_TIME) /
                            1000
                        )
                );
            }

            // new consts
            const decodeConst = BigNumber.from(2).pow(128);
            const futureTimestampBigNumber: BigNumber =
                currentTimestampBigNumber
                    .div(1000)
                    .add(
                        (REFRESH_INTERVAL * ANIMATION_MINIMUM_STEP_TIME) / 1000
                    );

            // calculate twap balances
            const initialBalances = await poolContract.getUserBalancesAtTime(
                userAddress,
                currentTimestampBigNumber.div(1000).toString()
            );
            const futureBalances = await poolContract.getUserBalancesAtTime(
                userAddress,
                futureTimestampBigNumber.toString()
            );

            const initialTwapBalance: BigNumber = BigNumber.from(tokenAddress == token0?.address ? initialBalances.balance0 : initialBalances.balance1);
            const futureTwapBalance: BigNumber = BigNumber.from(tokenAddress == token0?.address ? futureBalances.balance0 : futureBalances.balance1);

            return {
                initialBalance,
                initialTwapBalance,
                flowRate: futureBalance
                    .sub(initialBalance)
                    .div(REFRESH_INTERVAL),
                twapFlowRate: futureTwapBalance
                    .sub(initialTwapBalance)
                    .div(REFRESH_INTERVAL),
                startDate: flowInfo.timestamp,
            };
        }

        // set token0 state
        // eslint-disable-next-line vars-on-top, no-var
        var {
            initialBalance,
            initialTwapBalance,
            flowRate,
            twapFlowRate,
            startDate,
        } = await getTokenProps({ tokenAddress: token0.address });

        // TODO: Proposed replacement:
        // const token1Props = await getTokenProps({
        //     tokenAddress: token1.address,
        // });
        // const initialBalance0 = token1Props.initialBalance;
        // etc...

        const initialBalance0 = initialBalance;
        const initialTwapBalance0 = initialTwapBalance;
        const startDate0 = startDate;
        setCurrentBalance0(initialBalance);
        setCurrentTwapBalance0(initialTwapBalance);
        setFlowRate0(flowRate);
        setTwapFlowRate0(twapFlowRate);
        setIsTwap0(twapFlowRate.gt(0));

        // set token1 state
        // eslint-disable-next-line vars-on-top, no-var
        var {
            initialBalance,
            initialTwapBalance,
            flowRate,
            twapFlowRate,
            startDate,
        } = await getTokenProps({ tokenAddress: token1.address });

        setCurrentBalance1(initialBalance);
        setCurrentTwapBalance1(initialTwapBalance);
        setFlowRate1(flowRate);
        setTwapFlowRate1(twapFlowRate);
        setIsTwap1(twapFlowRate.gt(0));

        /*
        // compute average price from total amounts streamed
        if (twapFlowRate.gt(0) && initialTwapBalance.gt(0)) {
            setAveragePrice(
                initialBalance0.mul(1000).div(initialTwapBalance).toNumber() /
                1000
            );
        } else if (initialTwapBalance0.gt(0)) {
            setAveragePrice(
                initialBalance.mul(1000).div(initialTwapBalance0).toNumber() /
                1000
            );
        }*/

        // get current price
        /*
        const token0Flow: BigNumber = await poolContract.getFlowIn(
            token0.address
        );
        const token1Flow: BigNumber = await poolContract.getFlowIn(
            token1.address
        );
        */

        // get current price
        const token0Flow: BigNumber = BigNumber.from(
            await sf.cfaV1.getNetFlow({
                superToken: token0.address,
                account: poolAddress,
                providerOrSigner: provider,
            })
        );
        const token1Flow: BigNumber = BigNumber.from(
            await sf.cfaV1.getNetFlow({
                superToken: token1.address,
                account: poolAddress,
                providerOrSigner: provider,
            })
        );

        /*
        if (twapFlowRate.gt(0)) {
            // setCurrentPrice(token1Flow.mul(1000).div(token0Flow).toNumber() / 1000);
            setCurrentPrice(
                token0Flow.mul(1000).div(token1Flow).toNumber() / 1000
            );
        } else {
            // setCurrentPrice(token0Flow.mul(1000).div(token1Flow).toNumber() / 1000);
            setCurrentPrice(
                token1Flow.mul(1000).div(token0Flow).toNumber() / 1000
            );
        }
        */

        // set start date to most recent one
        setStartDate(
            startDate0.valueOf() > startDate.valueOf() ? startDate0 : startDate
        );

        // update isLoading and positionFound vars
        setPositionFound(initialBalance0.gt(0) || initialBalance.gt(0));
        setIsLoading(false);
    }

    // REFRESH(in milliseconds) = REFRESH_INTERVAL * ANIMATION_MINIMUM_STEP_TIME
    const [time, setTime] = useState(REFRESH_INTERVAL);
    useEffect(() => {
        const timer = setTimeout(() => {
            setTime(time + 1);
            if (time >= REFRESH_INTERVAL) {
                setTime(0);
                updateVars();
            }

            // animate frame
            setCurrentBalance0((c) => c.add(flowRate0));
            setCurrentBalance1((c) => c.add(flowRate1));
            setCurrentTwapBalance0((c) => c.add(twapFlowRate0));
            setCurrentTwapBalance1((c) => c.add(twapFlowRate1));
        }, ANIMATION_MINIMUM_STEP_TIME);
        return () => {
            clearTimeout(timer);
        };
        // TODO: Assess missing dependency array values
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [time]);

    // Reload info if any parameter changes
    useEffect(() => {
        setIsLoading(true);
        updateVars();
        // TODO: Assess missing dependency array values
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userAddress, chain, provider, token0, token1]);

    const cancelStream = async () => {
        let transactionHash;
        let result;
        try {
            if (
                token0 &&
                token1 &&
                address &&
                userAddress &&
                address === userAddress
            ) {
                const superfluid = await Framework.create({
                    chainId: mumbaiChainId,
                    provider,
                });

                // different operation if providing liquidity or not
                const operations: Operation[] = [];
                if (isTwap0) {
                    const operation = superfluid.cfaV1.deleteFlow({
                        sender: address,
                        receiver: getPoolAddress(token0.address, token1.address),
                        superToken: token1.address,
                    });
                    operations.push(operation);
                }
                if (isTwap1) {
                    const operation = superfluid.cfaV1.deleteFlow({
                        sender: address,
                        receiver: getPoolAddress(token0.address, token1.address),
                        superToken: token0.address,
                    });
                    operations.push(operation);
                }

                if (operations.length > 0) {
                    const batchCall = superfluid.batchCall(operations);
                    setIsDeleting(true);
                    // new signer object (Wagmi Update) requires new config, checking undefined
                    if (signer) {
                        result = await batchCall.exec(signer);
                    } else {
                        return;
                    }

                    transactionHash = result.hash;
                    const transactionReceipt = await result.wait();
                    setIsDeleting(false);

                    router.push("/my-streams");
                    showTransactionConfirmedToast(
                        "Deleted stream",
                        transactionReceipt.transactionHash
                    );
                }
            }
        } catch (error) {
            getErrorToast(error, transactionHash);
            setIsDeleting(false);
        }
    };

    const setOutboundAndInboundTokens = () => {
        if (token0 && token1) {
            // set swap tokens to this pool's tokens
            if (isTwap1) {
                store.setOutboundToken(token0);
                store.setInboundToken(token1);
            } else {
                store.setOutboundToken(token1);
                store.setInboundToken(token0);
            }
        }
    };

    const GET_DATA = gql`
    {
      syncs(first: 5) {
          id
          reserve0
          reserve1
          blockTimestamp
      }
    }
  `;

    const { error, data } = useQuery(GET_DATA);

    const [convertedData, setConvertedData] = useState<PriceHistory[]>([]);
    const minDifferenceRef = useRef(Infinity);
    const closestDateRef = useRef<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        /*const data = {
            syncs: []
        };
        
        const initialSync = {
            blockTimestamp: Math.floor(Date.now() / 1000),
            reserve0: "1000",
            reserve1: "1000"
        };
        
        data.syncs.push(initialSync);
        
        for (let i = 0; i < 1000; i++) {
            const lastSync = data.syncs[data.syncs.length - 1];
            const multiplier = Math.random() * (1.1 - 0.9) + 0.9;
            const newReserve0 = parseInt(lastSync.reserve0) * multiplier;
            const newReserve1 = parseInt(lastSync.reserve0) * parseInt(lastSync.reserve1) / newReserve0;
            const newSync = {
                blockTimestamp: lastSync.blockTimestamp + 10,
                reserve0: Math.floor(newReserve0).toString(),
                reserve1: Math.floor(newReserve1).toString()
            };
            data.syncs.push(newSync);
        }
        console.log(data)*/

        if (data !== undefined) {
            if (!startDate) {
                return;
            }

            try {
                setLoading(true);
                let currentIndex = -1;
                const newConvertedData: PriceHistory[] = []; // Create a new array to store the converted data

                [...data.syncs].forEach((item: {
                    blockTimestamp: any;
                    reserve0: { toString: () => string };
                    reserve1: { toString: () => string };
                }) => {
                    currentIndex++;

                    const blockTimestamp = new Date(item.blockTimestamp * 1000);
                    const difference = Math.abs(
                        blockTimestamp.getTime() - startDate.getTime()
                    );

                    if (difference < minDifferenceRef.current) {
                        minDifferenceRef.current = difference;
                        closestDateRef.current = currentIndex;
                    }

                    const convertedItem: PriceHistory = {
                        ...item,
                        blockTimestamp: blockTimestamp,
                        token0Price: parseFloat(ethers.utils.formatEther(item.reserve1.toString())) / parseFloat(ethers.utils.formatEther(item.reserve0.toString())),
                    };
                    newConvertedData.push(convertedItem);
                });

                const currentDate = new Date();

                const currentPriceData = { blockTimestamp: currentDate, token0Price: currentPrice }

                newConvertedData.push(currentPriceData)

                newConvertedData.sort(
                    (a, b) => a.blockTimestamp?.getTime() - b.blockTimestamp?.getTime()
                );

                setConvertedData(newConvertedData); // Update the state with the new converted data
                setLoading(false);
            } catch (err) {
                setLoading(false);
                console.log(err);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, startDate]);



    return (
        <div className="flex justify-center w-full">
            {isLoading || (!isLoading && positionFound) ? (
                <div
                    className={`w-full max-w-4xl space-y-4 mx-4 md:mx-8 pb-12 ${isLoading ? "opacity-" : ""
                        }`}
                >
                    <PriceChart
                        priceHistory={convertedData}
                        entry={closestDateRef.current}
                        token0={token0}
                        token1={token1}
                        currentPrice={currentPrice}
                        loading={loading === true && convertedData.length <= 0}
                    />
                    {userAddress && token0 && token1 && (
                        <div className="space-y-12 md:space-y-4">
                            <WidgetContainer
                                smallTitle="Total Amounts Swapped"
                                isUnbounded
                                userAddress={userAddress}
                                address={address}
                                isTwap0={isTwap0}
                                isTwap1={isTwap1}
                                isLoading={isLoading}
                                isDeleting={isDeleting}
                                setOutboundAndInboundTokens={setOutboundAndInboundTokens}
                                cancelStream={cancelStream}
                                padding="md:p-2"
                            >
                                <TotalAmountsStreamedWidget
                                    flowRate0={flowRate0}
                                    flowRate1={flowRate1}
                                    twapFlowRate0={twapFlowRate0}
                                    twapFlowRate1={twapFlowRate1}
                                    currentBalance0={currentBalance0}
                                    currentBalance1={currentBalance1}
                                    token0={token0}
                                    token1={token1}
                                    currentTwapBalance0={currentTwapBalance0}
                                    currentTwapBalance1={currentTwapBalance1}
                                    isLoading={false}
                                    startDate={startDate}
                                    endDate={startDate}
                                    price={averagePrice}
                                />
                            </WidgetContainer>
                            { /* // Do we want share buttons???????
                            <div className="flex items-center space-x-2 md:px-8 md:pt-2">
                                <p className="pr-2">Share:</p>
                                <ButtonWithInfoPopup
                                    message="Copy link"
                                    button={
                                        <button
                                            type="button"
                                            className="p-2 bg-aqueductBlue rounded-xl text-white"
                                            onClick={() => {
                                                if (address) {
                                                    navigator.clipboard.writeText(
                                                        getSharedLink(
                                                            "goerli",
                                                            address,
                                                            token0!.address,
                                                            token1!.address
                                                        )
                                                    );
                                                }
                                            }}
                                        >
                                            <BiLink size={22} />
                                        </button>
                                    }
                                />
                                <ButtonWithInfoPopup
                                    message="Share on Twitter"
                                    button={
                                        <a
                                            className="p-2 bg-[#1DA1F2] rounded-xl text-white"
                                            href={
                                                address
                                                    ? getTweetTemplate(
                                                        getSharedLink(
                                                            "goerli",
                                                            address,
                                                            token0!.address,
                                                            token1!.address
                                                        )
                                                    )
                                                    : ""
                                            }
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <IoLogoTwitter size={22} />
                                        </a>
                                    }
                                />
                            </div>
                                */}
                        </div>
                    )}
                </div>
            ) : (
                <PageNotFound />
            )}
        </div>
    );
};

export default PoolInteractionVisualization;