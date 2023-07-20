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
import useSuperToken from "../../../../../components/helpers/useSuperToken";
import { decodeRealTimeBalanceRes } from "../../../../../components/helpers/decodeRealTimeBalanceRes";
import usePool from "../../../../../components/helpers/usePool";
import { decodeGetUserBalancesAtTimeRes } from "../../../../../components/helpers/decodeGetUserBalancesAtTimeRes";
import useCFA from "../../../../../components/helpers/useCFA";
import { decodeGetFlowRes } from "../../../../../components/helpers/decodeGetFlowRes";
import { decodeGetReservesAtTimeRes } from "../../../../../components/helpers/decodeGetReservesAtTimeRes";

const ANIMATION_MINIMUM_STEP_TIME = 10;
const REFRESH_INTERVAL = 3000; // 300 * 100 = 30000 ms = 30 s

const PoolInteractionVisualization: NextPage = () => {
    // zustand
    const store = useStore();

    // wagmi
    const provider = useEthersProvider();
    const { chain } = useNetwork(); // TODO: use router param
    const { address } = useAccount();
    const signer = useEthersSigner();

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
    const [poolAddress, setPoolAddress] = useState<string>();

    // contracts
    const tokenContract0 = useSuperToken(token0?.address);
    const tokenContract1 = useSuperToken(token1?.address);
    const poolContract = usePool(poolAddress);
    const cfa = useCFA();

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

    useEffect(() => {
        if (token0 && token1) {
            setPoolAddress(getPoolAddress(token0.address, token1.address));
        }
    }, [token0, token1])

    async function updateVars() {
        if (!userAddress || !provider || !token0 || !token1 || !tokenContract0 || !tokenContract1 || !poolContract || !poolAddress) {
            return;
        }

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

            // batch call: get flows for both tokens + stored pool balances + reserves
            const [flow0, flow1, presentLockedBalances, futureLockedBalances, reserves] = await Promise.all([
                cfa.read.getFlow([token0.address, userAddress, poolAddress]),
                cfa.read.getFlow([token1.address, userAddress, poolAddress]),
                poolContract.read.getUserBalancesAtTime([userAddress, currentTimestamp]),
                poolContract.read.getUserBalancesAtTime([userAddress, futureTimestamp]),
                poolContract.read.getReservesAtTime([currentTimestamp])
            ]);

            const decodedFlowParams0 = decodeGetFlowRes(flow0);
            const decodedFlowParams1 = decodeGetFlowRes(flow1);
            const decodedPresentLockedBalances = decodeGetUserBalancesAtTimeRes(presentLockedBalances);
            const decodedFutureLockedBalances = decodeGetUserBalancesAtTimeRes(futureLockedBalances);
            const decodedReserves = decodeGetReservesAtTimeRes(reserves);

            const initialBalance0 = BigNumber.from(decodedFlowParams0.flowRate).mul(currentTimestampBigNumber.sub(BigNumber.from(decodedFlowParams0.timestamp).mul(1000)).div(1000));
            const futureBalance0 = BigNumber.from(decodedFlowParams0.flowRate).mul(currentTimestampBigNumber.sub(BigNumber.from(decodedFlowParams0.timestamp).mul(1000)).div(1000).add((REFRESH_INTERVAL * ANIMATION_MINIMUM_STEP_TIME) / 1000));
            const initialBalance1 = BigNumber.from(decodedFlowParams1.flowRate).mul(currentTimestampBigNumber.sub(BigNumber.from(decodedFlowParams1.timestamp).mul(1000)).div(1000));
            const futureBalance1 = BigNumber.from(decodedFlowParams1.flowRate).mul(currentTimestampBigNumber.sub(BigNumber.from(decodedFlowParams1.timestamp).mul(1000)).div(1000).add((REFRESH_INTERVAL * ANIMATION_MINIMUM_STEP_TIME) / 1000));

            setCurrentBalance0(initialBalance0);
            setCurrentBalance1(initialBalance1);
            setCurrentTwapBalance0(decodedPresentLockedBalances.balance0);
            setCurrentTwapBalance1(decodedPresentLockedBalances.balance1);

            setFlowRate0(futureBalance0.sub(initialBalance0).div(REFRESH_INTERVAL));
            setFlowRate1(futureBalance1.sub(initialBalance1).div(REFRESH_INTERVAL));
            const calcTwapFlowRate0 = decodedFutureLockedBalances.balance0.sub(decodedPresentLockedBalances.balance0).div(REFRESH_INTERVAL);
            const calcTwapFlowRate1 = decodedFutureLockedBalances.balance1.sub(decodedPresentLockedBalances.balance1).div(REFRESH_INTERVAL);
            setTwapFlowRate0(calcTwapFlowRate0);
            setTwapFlowRate1(calcTwapFlowRate1);
            setIsTwap0(calcTwapFlowRate0.gt(0));
            setIsTwap1(calcTwapFlowRate1.gt(0));

            // set start date to most recent one
            setStartDate(
                new Date(
                    (
                        Number(decodedFlowParams0.timestamp) > Number(decodedFlowParams1.timestamp) ?
                            Number(decodedFlowParams0.timestamp) :
                            Number(decodedFlowParams1.timestamp)
                    ) * 1000
                )
            );

            // compute current and average prices
            if (BigNumber.from(decodedFlowParams0.flowRate).gt(0)) {
                setCurrentPrice(
                    decodedReserves.reserve1.mul(1000).div(decodedReserves.reserve0).toNumber() / 1000
                );
                setAveragePrice(
                    decodedPresentLockedBalances.balance1.mul(1000).div(initialBalance0).toNumber() / 1000
                );
            } else if (BigNumber.from(decodedFlowParams1.flowRate).gt(0)) {
                setCurrentPrice(
                    decodedReserves.reserve0.mul(1000).div(decodedReserves.reserve1).toNumber() / 1000
                );
                setAveragePrice(
                    decodedPresentLockedBalances.balance0.mul(1000).div(initialBalance1).toNumber() / 1000
                );
            }

            // update isLoading and positionFound vars
            setPositionFound(initialBalance0.gt(0) || initialBalance1.gt(0));
        } catch {
            setPositionFound(false)
        }

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
    }, [userAddress, chain, provider, token0, token1, poolAddress]);

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

    const currentDate = new Date();

    const totalPeriod = new Date(currentDate.getFullYear() - 1, currentDate.getMonth()).getTime();

    const GET_DATA = gql`
    {
        syncs(first: 500) {
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
    const periodSelect = useRef<string>('1W');

    useEffect(() => {
        if (data !== undefined) {
            if (!startDate) {
                return;
            }

            const currentDate = new Date();

            const timePeriodOptions: { [key: string]: number } = {
                '1H': currentDate.getTime() - (60 * 60 * 1000),
                '1D': currentDate.getTime() - (24 * 60 * 60 * 1000),
                '1W': currentDate.getTime() - (7 * 24 * 60 * 60 * 1000),
                '1M': new Date(currentDate.getFullYear(), currentDate.getMonth() - 1).getTime(),
                '1Y': totalPeriod,
            };

            closestDateRef.current = null;
            minDifferenceRef.current = Infinity;

            try {
                setLoading(true);
                let currentIndex = -1;
                const newConvertedData: PriceHistory[] = [];

                const sortedSyncs = [...data.syncs].sort((a, b) => {
                    const dateA = new Date(a.blockTimestamp * 1000);
                    const dateB = new Date(b.blockTimestamp * 1000);
                    return dateA.getTime() - dateB.getTime();
                });

                sortedSyncs.forEach((item: {
                    blockTimestamp: any;
                    reserve0: { toString: () => string };
                    reserve1: { toString: () => string };
                }) => {
                    currentIndex++
                    const blockTimestamp = new Date(item.blockTimestamp * 1000);

                    const formattedDate = blockTimestamp.toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        hour12: true
                    });

                    if (blockTimestamp.getTime() >= timePeriodOptions[periodSelect.current]) {

                        const formattedStartDate = Math.floor(startDate.getTime() / 1000).toString();

                        if (item.blockTimestamp === formattedStartDate) {
                            closestDateRef.current = currentIndex;
                        }

                        const convertedItem: PriceHistory = {
                            ...item,
                            blockTimestamp: formattedDate,
                            token0Price: parseFloat(ethers.utils.formatEther(item.reserve1.toString())) / parseFloat(ethers.utils.formatEther(item.reserve0.toString())),
                        };

                        newConvertedData.push(convertedItem);
                    }
                });

                const formattedCurrentDate = currentDate.toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true
                });

                const currentPriceData = { blockTimestamp: formattedCurrentDate, token0Price: currentPrice }

                newConvertedData.push(currentPriceData)

                newConvertedData.sort((a, b) => {
                    const dateA = new Date(a.blockTimestamp);
                    const dateB = new Date(b.blockTimestamp);
                    return dateA.getTime() - dateB.getTime();
                });

                setConvertedData(newConvertedData);
                setLoading(false);
            } catch {
                setLoading(false);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, startDate, periodSelect.current]);

    return (
        <div className="flex justify-center w-full">
            {isLoading || (!isLoading && positionFound) ? (
                <div
                    className={`w-full max-w-4xl space-y-4 mx-4 md:mx-8 pb-12 ${isLoading ? "opacity-" : ""
                        }`}
                >
                    <div className="text-2xl text-white/50 hover:text-white transition-all duration-300 rounded-2xl bg-item px-3 py-2 w-min mt-5">
                        <Link href="/">
                            <IoArrowBack />
                        </Link>
                    </div>
                    <PriceChart
                        priceHistory={convertedData}
                        entry={closestDateRef.current}
                        token0={token0}
                        token1={token1}
                        currentPrice={currentPrice}
                        loading={loading === true && convertedData.length <= 0}
                        period={periodSelect}
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