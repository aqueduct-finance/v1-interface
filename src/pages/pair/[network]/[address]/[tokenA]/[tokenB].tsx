/* eslint-disable radix */
import type { NextPage } from "next";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { IoArrowBack } from "react-icons/io5";
import { BigNumber, ethers } from "ethers";
import { useAccount, useNetwork } from "wagmi";
import { Framework, WrapperSuperToken } from "@superfluid-finance/sdk-core";
import Operation from "@superfluid-finance/sdk-core/dist/module/Operation";
import { useEthersProvider } from "../../../../../components/providers/provider";
import { useEthersSigner } from "../../../../../components/providers/signer";
import { TokenTypes } from "../../../../../types/TokenOption";
import getPoolAddress from "../../../../../components/helpers/getPool";
import WidgetContainer from "../../../../../components/widgets/WidgetContainer";
import PageNotFound from "../../../../../components/PageNotFound";
import { useStore } from "../../../../../store";
import getToken from "../../../../../utils/getToken";
import { mumbaiChainId } from "../../../../../utils/constants";
import { showTransactionConfirmedToast } from "../../../../../components/Toasts";
import getErrorToast from "../../../../../utils/getErrorToast";
import TotalAmountsStreamedWidget from "../../../../../components/widgets/TotalAmountsStreamedWidget";
import PriceChart from "../../../../../components/streamview/PriceChart";
import useSuperToken from "../../../../../components/helpers/useSuperToken";
import usePool from "../../../../../components/helpers/usePool";
import { decodeGetUserBalancesAtTimeRes } from "../../../../../components/helpers/decodeGetUserBalancesAtTimeRes";
import useCFA from "../../../../../components/helpers/useCFA";
import { decodeGetFlowRes } from "../../../../../components/helpers/decodeGetFlowRes";
import { decodeGetReservesAtTimeRes } from "../../../../../components/helpers/decodeGetReservesAtTimeRes";
import poolABI from "../../../../../utils/poolABI";
import getPoolContract from "../../../../../components/helpers/getPoolContract";

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

    // state for token1
    const [currentTwapBalance1, setCurrentTwapBalance1] = useState<BigNumber>(
        ethers.BigNumber.from(0)
    );
    const [twapFlowRate1, setTwapFlowRate1] = useState<BigNumber>(
        ethers.BigNumber.from(0)
    );

    // average price
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

            // batch call: get flowrate + stored pool balances + pool token addresses
            const [flow0, presentLockedBalances, futureLockedBalances, poolToken0] = await Promise.all([
                cfa.read.getFlow([token0.address, userAddress, poolAddress]),
                poolContract.read.getUserBalancesAtTime([userAddress, currentTimestamp]),
                poolContract.read.getUserBalancesAtTime([userAddress, futureTimestamp]),
                poolContract.read.token0()
            ]);

            const decodedFlowParams0 = decodeGetFlowRes(flow0);
            const decodedPresentLockedBalances = decodeGetUserBalancesAtTimeRes(presentLockedBalances);
            const decodedFutureLockedBalances = decodeGetUserBalancesAtTimeRes(futureLockedBalances);

            // reverse tokens if pool tokens are in opposite order
            const presentLockedBalances1 = token0.address == poolToken0 ? decodedPresentLockedBalances.balance1 : decodedPresentLockedBalances.balance0;
            const futureLockedBalances1 = token0.address == poolToken0 ? decodedFutureLockedBalances.balance1 : decodedFutureLockedBalances.balance0;

            const initialBalance0 = BigNumber.from(decodedFlowParams0.flowRate).mul(currentTimestampBigNumber.sub(BigNumber.from(decodedFlowParams0.timestamp).mul(1000)).div(1000));
            const futureBalance0 = BigNumber.from(decodedFlowParams0.flowRate).mul(currentTimestampBigNumber.sub(BigNumber.from(decodedFlowParams0.timestamp).mul(1000)).div(1000).add((REFRESH_INTERVAL * ANIMATION_MINIMUM_STEP_TIME) / 1000));

            setCurrentBalance0(initialBalance0);
            setCurrentTwapBalance1(presentLockedBalances1);

            setFlowRate0(futureBalance0.sub(initialBalance0).div(REFRESH_INTERVAL));
            const calcTwapFlowRate1 = futureLockedBalances1.sub(presentLockedBalances1).div(REFRESH_INTERVAL);
            setTwapFlowRate1(calcTwapFlowRate1);

            // set start date
            setStartDate(
                new Date(
                    Number(decodedFlowParams0.timestamp) * 1000
                )
            );

            // compute average price
            setAveragePrice(
                presentLockedBalances1.mul(1000).div(initialBalance0).toNumber() / 1000
            );

            // update isLoading and positionFound vars
            setPositionFound(initialBalance0.gt(0));
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
            if (!token0 || !token1 || !address || !userAddress || address !== userAddress) { return; }
            
            const poolAddress = getPoolAddress(token0.address, token1.address);
            const poolContract = getPoolContract(poolAddress);

            if (!poolAddress || !poolContract) { return; }

            const superfluid = await Framework.create({
                chainId: mumbaiChainId,
                provider,
            });

            // setup batch call
            const operations: Operation[] = [];

            // delete flow of token0
            const deleteFlow = superfluid.cfaV1.deleteFlow({
                sender: address,
                receiver: poolAddress,
                superToken: token0.address,
            });
            operations.push(deleteFlow);

            // retrieve funds of token1
            const poolInteface = new ethers.utils.Interface(poolABI);
            const callData = poolInteface.encodeFunctionData("retrieveFunds", [token1.address]);
            const retrieveFunds = superfluid.host.callAppAction(poolAddress, callData);
            operations.push(retrieveFunds);

            if (signer) {
                retrieveFunds.exec(signer);
                return;
            }

            // if selected, unwrap token1
            const lockedBalances = await poolContract.read.getRealTimeUserBalances([userAddress]);
            const decodedLockedBalances = decodeGetUserBalancesAtTimeRes(lockedBalances);
            const superToken = (await superfluid.loadSuperToken(token1.address)) as WrapperSuperToken;
            const unwrapTokens = superToken.downgrade({ amount: decodedLockedBalances.balance1.toString() });
            operations.push(unwrapTokens);

            // batch call
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
        } catch (error) {
            console.log(error)
            getErrorToast(error, transactionHash);
            setIsDeleting(false);
        }
    };

    const setOutboundAndInboundTokens = () => {
        if (token0 && token1) {
            // set swap tokens to this pool's tokens
            store.setOutboundToken(token0);
            store.setInboundToken(token1);
        }
    };

    return (
        <div className="flex justify-center w-full pb-24 md:py-24 overflow-hidden">
            {isLoading || (!isLoading && positionFound) ? (
                <div
                    className={`w-full max-w-4xl space-y-4 mx-4 md:mx-8 pb-12 ${isLoading ? "opacity-" : ""
                        }`}
                >
                    <div className="text-2xl text-white/50 hover:text-white transition-all duration-300 rounded-2xl bg-white/5 px-3 py-2 w-min mt-5">
                        <Link href="/my-swaps">
                            <IoArrowBack />
                        </Link>
                    </div>
                    <div className="py-8">
                        <PriceChart
                            token0={token0}
                            token1={token1}
                            startDate={startDate}
                        />
                    </div>
                    {userAddress && token0 && token1 && (
                        <div className="space-y-12 md:space-y-4">
                            <WidgetContainer
                                smallTitle="Total Amounts Swapped"
                                isUnbounded
                                userAddress={userAddress}
                                address={address}
                                isLoading={isLoading}
                                isDeleting={isDeleting}
                                setOutboundAndInboundTokens={setOutboundAndInboundTokens}
                                cancelStream={cancelStream}
                                padding="md:p-2"
                            >
                                <TotalAmountsStreamedWidget
                                    flowRate0={flowRate0}
                                    twapFlowRate1={twapFlowRate1}
                                    currentBalance0={currentBalance0}
                                    token0={token0}
                                    token1={token1}
                                    currentTwapBalance1={currentTwapBalance1}
                                    isLoading={false}
                                    startDate={startDate}
                                    endDate={startDate}
                                    price={averagePrice}
                                />
                            </WidgetContainer>
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