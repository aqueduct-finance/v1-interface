import type { NextPage } from 'next'
import React, { useEffect, useState } from 'react';
import WidgetContainer from '../../../../components/widgets/WidgetContainer';
import { useRouter } from 'next/router';
import { TokenTypes } from '../../../../types/TokenOption';
import { useAccount, useNetwork } from 'wagmi';
import useCFA from '../../../../components/helpers/useCFA';
import { useEthersProvider } from '../../../../components/providers/provider';
import { ExplicitAny } from '../../../../types/ExplicitAny';
import LockedBalance from '../../../../types/LockedBalance';
import getToken from '../../../../utils/getToken';
import { mumbaiChainId } from '../../../../utils/constants';
import getWriteablePoolContract from '../../../../components/helpers/getWriteablePoolContract';
import { GetContractReturnType, parseAbiItem } from 'viem';
import { BigNumber, ethers } from 'ethers';
import { decodeGetFlowRes } from '../../../../components/helpers/decodeGetFlowRes';
import { decodeGetUserBalancesAtTimeRes } from '../../../../components/helpers/decodeGetUserBalancesAtTimeRes';
import TotalAmountsStreamedWidget from '../../../../components/widgets/TotalAmountsStreamedWidget';
import RetrieveFundsState from '../../../../types/RetrieveFundsState';
import Image from 'next/image';
import { FaArrowRight, FaChevronLeft } from 'react-icons/fa6';
import BalanceField from '../../../../components/BalanceField';
import theme from '../../../../styles/theme';
import { getPublicClient } from '@wagmi/core'
import getPoolContract from '../../../../components/helpers/getPoolContract';
import parseTokenAmount from '../../../../utils/parseTokenAmount';
import useWriteableSuperToken from '../../../../components/helpers/useWriteableSuperToken';
import LoadingSpinner from '../../../../components/LoadingSpinner';
import PageNotFound from '../../../../components/PageNotFound';
import { Framework } from '@superfluid-finance/sdk-core';
import { useEthersSigner } from '../../../../components/providers/signer';


const ANIMATION_MINIMUM_STEP_TIME = 10;
const REFRESH_INTERVAL = 3000; // 300 * 100 = 30000 ms = 30 s

const Position: NextPage = () => {

    // url params
    const router = useRouter();
    const [writePoolContract, setWritePoolContract] = useState<GetContractReturnType>();
    const [poolContract, setPoolContract] = useState<GetContractReturnType>();
    const [isToken0, setIsToken0] = useState<boolean>();
    const signer = useEthersSigner();

    const [token0, setToken0] = useState<TokenTypes>();
    const [token1, setToken1] = useState<TokenTypes>();
    const token1Contract = useWriteableSuperToken(token1?.address);

    const provider = useEthersProvider();
    const { chain } = useNetwork();
    const { address } = useAccount();

    const [returnedAmount, setReturnedAmount] = useState<BigNumber>(
        ethers.BigNumber.from(0)
    );

    const [currentTwapBalance, setCurrentTwapBalance] = useState<BigNumber>(
        ethers.BigNumber.from(0)
    );
    const [twapFlowRate, setTwapFlowRate] = useState<BigNumber>(
        ethers.BigNumber.from(0)
    );

    const [state, setState] = useState<RetrieveFundsState>();
    const [initialState, setInitialState] = useState<RetrieveFundsState>();

    // component state
    const [isLoading, setIsLoading] = useState(true);
    const [positionFound, setPositionFound] = useState(false);

    // transaction status
    const [isCancelling, setIsCancelling] = useState(false);
    const [isCollecting, setIsCollecting] = useState(false);
    const [isUnwrwapping, setIsUnwrapping] = useState(false);

    useEffect(() => {
        const chainId = chain?.id;

        async function getPoolAndTokens() {
        
            setIsLoading(true);

            try {
                // check params
                if (
                    typeof router.query.pool !== "string" ||
                    typeof router.query.token !== "string" || 
                    typeof router.query.state !== "string" ||
                    (
                        router.query.state !== RetrieveFundsState.CANCEL_SWAP && 
                        router.query.state !== RetrieveFundsState.COLLECT_FUNDS &&
                        router.query.state !== RetrieveFundsState.UNWRAP_TOKENS &&
                        router.query.state !== RetrieveFundsState.DONE
                    )
                ) {
                    setPositionFound(false);
                    setIsLoading(false);
                    return;
                }
                setState(router.query.state);
                if (!initialState) {
                    setInitialState(router.query.state);
                }

                // get pool
                const pool = getPoolContract(router.query.pool);
                const writeablePool = await getWriteablePoolContract(router.query.pool);
                if (!pool || !writeablePool || !chainId) {
                    setPositionFound(false);
                    setIsLoading(false);
                    return;
                }
                setPoolContract(pool);
                setWritePoolContract(writeablePool);

                const token0Address: string = await pool.read.token0();
                const token1Address: string = await pool.read.token1();
                if (!token0Address || !token1Address || (token0Address !== router.query.token && token1Address !== router.query.token)) {
                    setPositionFound(false);
                    setIsLoading(false);
                    return;
                }

                // router.query.token is the token they are swapping to
                const _isToken0 = router.query.token === token0Address;
                setIsToken0(_isToken0);

                const tokenA = await getToken({
                    tokenAddress: token0Address,
                    provider,
                    chainId: chainId,
                });
                const tokenB = await getToken({
                    tokenAddress: token1Address,
                    provider,
                    chainId: chainId,
                });

                if (!tokenA || !tokenB) {
                    setPositionFound(false);
                    setIsLoading(false);
                    return;
                }
                if (_isToken0) {
                    setToken0(tokenB);
                    setToken1(tokenA);
                } else {
                    setToken0(tokenA);
                    setToken1(tokenB);
                }

                setPositionFound(true);
                setIsLoading(false);
            } catch {
                setPositionFound(false);
                setIsLoading(false);
            }
        }

        getPoolAndTokens();
    }, [router.query, chain, provider]);

    async function updateData() {
        if (!address || !chain || !provider || !poolContract) { return; }

        try {
            // get current timestamp
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

            // batch call: get present/future user balances
            const [presentLockedBalances, futureLockedBalances] = await Promise.all([
                poolContract.read.getUserBalancesAtTime([address, currentTimestamp]),
                poolContract.read.getUserBalancesAtTime([address, futureTimestamp])
            ]);

            const decodedPresentLockedBalances = decodeGetUserBalancesAtTimeRes(presentLockedBalances);
            const decodedFutureLockedBalances = decodeGetUserBalancesAtTimeRes(futureLockedBalances);

            const presentLockedBalance = isToken0 ? decodedPresentLockedBalances.balance0 : decodedPresentLockedBalances.balance1;
            const futureLockedBalance = isToken0 ? decodedFutureLockedBalances.balance0 : decodedFutureLockedBalances.balance1;

            setCurrentTwapBalance(presentLockedBalance);

            // calculate locked balance flow rate
            const calcTwapFlowRate = futureLockedBalance.sub(presentLockedBalance).div(REFRESH_INTERVAL);
            setTwapFlowRate(calcTwapFlowRate);

            setPositionFound(true);
            setIsLoading(false);
        } catch {
            setPositionFound(false);
            setIsLoading(false);
        }
    }

    useEffect(() => {
        updateData();
    }, [address, chain, provider, poolContract, isToken0]);

    // REFRESH(in milliseconds) = REFRESH_INTERVAL * ANIMATION_MINIMUM_STEP_TIME
    const [time, setTime] = useState(REFRESH_INTERVAL);
    useEffect(() => {
        if (twapFlowRate.gt(0)) {
            const timer = setTimeout(() => {
                setTime(time + 1);
                if (time >= REFRESH_INTERVAL) {
                    setTime(0);
                    updateData();
                }

                // animate frame
                setCurrentTwapBalance((b) => b.add(twapFlowRate));
            }, ANIMATION_MINIMUM_STEP_TIME);
            return () => {
                clearTimeout(timer);
            };
        }
    }, [time, twapFlowRate]);

    const cancelStream = async () => {
        try {
            if (!token0 || !token1 || !address || !poolContract) { return; }

            setIsCancelling(true);

            const superfluid = await Framework.create({
                chainId: mumbaiChainId,
                provider,
            });

            // delete flow of token0
            const deleteFlow = superfluid.cfaV1.deleteFlow({
                sender: address,
                receiver: poolContract.address,
                superToken: token0.address,
            });
            const result = await deleteFlow.exec(signer);
            await result.wait();

            setIsCancelling(false);

            router.push(`/position/${poolContract.address}/${token1.address}/${RetrieveFundsState.COLLECT_FUNDS}`);
        } catch (error) {
            setIsCancelling(false);
        }
    };

    const collectFunds = async () => {
        if (!writePoolContract || !token1) { return; }

        setIsCollecting(true);

        try {
            const publicClient = getPublicClient({ chainId: 80001 }); 

            // get funds
            const hash = await writePoolContract.write.retrieveFunds([token1.address]);
            const transaction = await publicClient.waitForTransactionReceipt({ hash: hash });

            // get amount retrieved
            const logs = await publicClient.getLogs({  
                address: writePoolContract.address,
                event: parseAbiItem('event RetrieveFunds(address superToken, address recipient, uint256 returnedBalance)'),
                blockHash: transaction.blockHash,
            });
            const retrievalEvent = logs.find((l) => l.args.recipient === address);
            if (!retrievalEvent) {
                return;
            }

            // move to unwrapping modal and show user removed amount
            const returnedBalance = retrievalEvent.args.returnedBalance;
            if (!returnedBalance) {
                return;
            }
            setReturnedAmount(BigNumber.from(returnedBalance));
            router.push(`/position/${writePoolContract.address}/${token1.address}/${RetrieveFundsState.UNWRAP_TOKENS}`);

            setIsCollecting(false);
        } catch {
            setIsCollecting(false);
        }
    }

    const unwrapTokens = async () => {
        if (!token1Contract || !returnedAmount || returnedAmount.lte(0) || !writePoolContract || !token1) { return; }

        setIsUnwrapping(true);

        try {
            const publicClient = getPublicClient({ chainId: 80001 }); 

            // get funds
            const hash = await token1Contract.write.downgrade([returnedAmount]);
            const transaction = await publicClient.waitForTransactionReceipt({ hash: hash });

            router.push(`/position/${writePoolContract.address}/${token1.address}/${RetrieveFundsState.DONE}`);
            setIsUnwrapping(false);
        } catch {
            setIsUnwrapping(false);
        }
    }

    function getContent(): React.ReactNode {
        if (state === RetrieveFundsState.CANCEL_SWAP) {
            return (
                <div className='space-y-2'>
                    <div className='flex px-6 py-4 rounded-xl bg-white/10 items-center justify-between text-white/75'>
                        <p>
                            Swapping:
                        </p>
                        {
                            isLoading 
                            ?
                            <div className='w-1/4 h-5 rounded-md bg-white/5 animate-pulse' />
                            :
                            (
                                token0 && token1 &&
                                <div className="flex text-sm space-x-1 font-medium items-center">
                                    <p>{token0.symbol}</p>
                                    <Image
                                        src={token0.logoURI}
                                        className="drop-shadow-md"
                                        width="16"
                                        height="16"
                                        alt={token0.name}
                                    />
                                    <FaArrowRight size={10} />
                                    <p>{token1.symbol}</p>
                                    <Image
                                        src={token1.logoURI}
                                        className="drop-shadow-md"
                                        width="16"
                                        height="16"
                                        alt={token1.name}
                                    />
                                </div>
                            )
                        }
                    </div>
                    <div className='text-sm flex px-8 py-6 rounded-xl bg-white/5 items-center justify-between text-white/50'>
                        {`To cancel your swap, you will cancel your ${token0?.symbol ?? 'supertoken'} stream. In the next step, you will be able to remove your swapped ${token1?.symbol ?? 'funds'} from the pool, and then have the option to unwrap your ${token1 ? `${token1.symbol} into ${token1.underlyingToken?.symbol}.` : 'supertokens.'}`}
                    </div>
                    <div className='pt-8'>
                        <button 
                            disabled={isLoading || isCancelling}
                            className='w-full h-16 flex items-center justify-center disabled:opacity-40 transition-all duration-300'
                            style={{
                                background: theme.swapButton,
                                borderRadius: theme.swapButtonRadius,
                                color: theme.primaryText,
                                fontSize: theme.swapButtonFontSize
                            }}
                            onClick={() => {
                                cancelStream();
                            }}
                        >
                            {
                                isCancelling 
                                ?
                                <LoadingSpinner size={30} />
                                :
                                'Cancel swap'
                            }
                        </button>
                    </div>
                </div>
            )
        }

        if (state === RetrieveFundsState.COLLECT_FUNDS) {
            return (
                <div className='space-y-2'>
                    <div className='flex px-6 py-4 rounded-xl bg-white/10 items-center justify-between text-white/75'>
                        <p>
                            Swapping:
                        </p>
                        {
                            isLoading 
                            ?
                            <div className='w-1/4 h-5 rounded-md bg-white/5 animate-pulse' />
                            :
                            (
                                token0 && token1 &&
                                <div className="flex text-sm space-x-1 font-medium items-center">
                                    <p>{token0.symbol}</p>
                                    <Image
                                        src={token0.logoURI}
                                        className="drop-shadow-md"
                                        width="16"
                                        height="16"
                                        alt={token0.name}
                                    />
                                    <FaArrowRight size={10} />
                                    <p>{token1.symbol}</p>
                                    <Image
                                        src={token1.logoURI}
                                        className="drop-shadow-md"
                                        width="16"
                                        height="16"
                                        alt={token1.name}
                                    />
                                </div>
                            )
                        }
                    </div>
                    <div className='flex px-6 py-4 rounded-xl bg-white/10 items-center justify-between text-white/75'>
                        <p>
                            Swapped amount:
                        </p>
                        {
                            isLoading 
                            ?
                            <div className='w-1/3 h-5 rounded-md bg-white/5 animate-pulse' />
                            :
                            (
                                token1 &&
                                <div className='flex space-x-2 items-center justify-center'>
                                    <BalanceField
                                        currentBalance={currentTwapBalance}
                                        isTwap
                                        token={token1}
                                        numDecimals={
                                            19 -
                                            twapFlowRate.add(1000).toString().length -
                                            (parseInt(twapFlowRate.toString()[0]) > 5 ? 1 : 0)
                                        }
                                        isLoading={isLoading}
                                        customText='text-white text-md items-center space-x-1 font-semibold'
                                        customLogo='w-4 h-4'
                                    />
                                </div>
                            )
                        }
                    </div>
                    <div className='text-sm flex px-8 py-6 rounded-xl bg-white/5 items-center justify-between text-white/50'>
                        Your swapped funds are stored securely in the pool, and can be removed at any time. Click the button below to remove your wrapped tokens, and you will have an option at the next step to unwrap them.
                    </div>
                    <div className='pt-8'>
                        <button 
                            disabled={isLoading || isCollecting}
                            className='w-full h-16 flex items-center justify-center disabled:opacity-40 transition-all duration-300'
                            style={{
                                background: theme.swapButton,
                                borderRadius: theme.swapButtonRadius,
                                color: theme.primaryText,
                                fontSize: theme.swapButtonFontSize
                            }}
                            onClick={() => {
                                collectFunds();
                            }}
                        >
                            {
                                isCollecting 
                                ?
                                <LoadingSpinner size={30} />
                                :
                                token1 && `Collect ${token1.symbol}`
                            }
                        </button>
                    </div>
                </div>
            )
        }

        if (state === RetrieveFundsState.UNWRAP_TOKENS) {
            return (
                <div className='space-y-2'>
                    <div className='flex px-6 py-4 rounded-xl bg-white/10 items-center justify-between text-white/75'>
                        <p>
                            Collected amount:
                        </p>
                        {
                            isLoading 
                            ?
                            <div className='w-1/3 h-5 rounded-md bg-white/5 animate-pulse' />
                            :
                            <div className='flex space-x-2 items-center justify-center'>
                                {
                                    returnedAmount && token1 &&
                                    <div className="flex text-md space-x-1 text-white font-semibold monospace-font items-center">
                                        <p>
                                            {parseTokenAmount({token: token1, amount: returnedAmount})}
                                        </p>
                                        <Image
                                            src={token1.logoURI}
                                            className="drop-shadow-md"
                                            width="16"
                                            height="16"
                                            alt={token1.name}
                                        />
                                    </div>
                                }
                            </div>
                        }
                    </div>
                    <div className='text-sm flex px-8 py-6 rounded-xl bg-white/5 items-center justify-between text-white/50'>
                        The above amount of wrapped tokens were collected from the pool. You can now optionally unwrap those tokens.
                    </div>
                    <div className='pt-8'>
                        <button 
                            disabled={isLoading || isUnwrwapping}
                            className='w-full h-16 flex items-center justify-center disabled:opacity-40 transition-all duration-300'
                            style={{
                                background: theme.swapButton,
                                borderRadius: theme.swapButtonRadius,
                                color: theme.primaryText,
                                fontSize: theme.swapButtonFontSize
                            }}
                            onClick={() => {
                                unwrapTokens();
                            }}
                        >
                            {
                                isUnwrwapping 
                                ?
                                <LoadingSpinner size={30} />
                                :
                                token1 && `Unwrap ${token1.symbol}`
                            }
                        </button>
                    </div>
                </div>
            )
        }

        if (state === RetrieveFundsState.DONE) {
            return (
                <div className='space-y-2 pt-4'>
                    <div className='text-sm flex px-8 py-6 rounded-xl bg-white/5 items-center justify-between text-white/50'>
                        {`Success! You should see your unwrapped tokens reflected in your ${token1?.underlyingToken?.symbol ?? 'token'} balance. Note that if you are still swapping, the funds you removed will no longer be shown when viewing your position. `}
                    </div>
                    <div className='pt-8'>
                        <button 
                            className='w-full h-16 flex items-center justify-center bg-white/5 hover:bg-white/10 border-white/5 border-2 space-x-2'
                            style={{
                                borderRadius: theme.swapButtonRadius,
                                color: theme.primaryText,
                                fontSize: theme.swapButtonFontSize
                            }}
                            onClick={() => {
                                router.push(`/my-swaps`);
                            }}
                        >
                            <FaChevronLeft size={15} className='text-white/40 -ml-4' />
                            <p>Back to your swaps</p>
                        </button>
                    </div>
                </div>
            )
        }
    }

    return (
        <div className='flex flex-col 2xl:flex-row 2xl:space-x-8 w-full items-center 2xl:justify-center'>
            {isLoading || (!isLoading && positionFound) ? (
                <WidgetContainer
                    /*smallTitle={
                        state === RetrieveFundsState.CANCEL_SWAP ? 'Cancel Swap' :
                        state === RetrieveFundsState.COLLECT_FUNDS ? 'Collect Funds' :
                        state === RetrieveFundsState.UNWRAP_TOKENS ? 'Unwrap Tokens' : ''
                    }*/
                    userAddress={address}
                    address={address}
                    isLoading={isLoading}
                    padding="md:p-2 md:py-5"
                >
                    <div className='text-white px-4'>
                        {
                            state && initialState &&
                            <ProgressNumbers 
                                state={state} 
                                initialState={initialState} 
                            />
                        }
                        <div className="pl-1 pr-4 py-5 flex items-center sm:text-lg text-sm font-semibold w-min text-white whitespace-nowrap">
                            {
                                state === RetrieveFundsState.CANCEL_SWAP ? 'Cancel Swap' :
                                state === RetrieveFundsState.COLLECT_FUNDS ? 'Collect Funds' :
                                state === RetrieveFundsState.UNWRAP_TOKENS ? 'Unwrap Tokens' : ''
                            }
                        </div>
                        <div>
                            {getContent()}
                        </div>
                    </div>
                </WidgetContainer>
            ) : (
                <PageNotFound />
            )}
        </div>
    )
}

interface ProgressNumbersProps {
    state: RetrieveFundsState;
    initialState: RetrieveFundsState;
}

const ProgressNumbers = ({state, initialState}: ProgressNumbersProps) => {

    // only show states that come after initialState
    let states: RetrieveFundsState[] = [];
    if (initialState === RetrieveFundsState.CANCEL_SWAP) {
        states = [
            RetrieveFundsState.CANCEL_SWAP,
            RetrieveFundsState.COLLECT_FUNDS,
            RetrieveFundsState.UNWRAP_TOKENS
        ];
    } else if (initialState === RetrieveFundsState.COLLECT_FUNDS) {
        states = [
            RetrieveFundsState.COLLECT_FUNDS,
            RetrieveFundsState.UNWRAP_TOKENS
        ];
    } else {
        return;
    }

    return (
        <div className='flex space-x-3 w-full items-center justify-center pt-5'>
            {
                states.map((s, i) => {
                    return (
                        <div 
                            className={`flex w-8 h-8 rounded-full items-center justify-center text-xs border-[1px] border-white/30 ${state === s ? 'bg-white/20 text-white/50' : 'text-white/40'}`}
                        >
                            {i + 1}
                        </div>
                    )
                })
            }
        </div>
    )
}

export default Position;
