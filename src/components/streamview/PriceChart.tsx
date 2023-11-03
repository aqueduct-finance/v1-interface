import React, { useEffect, useRef, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, Label, ResponsiveContainer } from 'recharts';
import { TokenTypes } from "../../types/TokenOption";
import { PriceHistory } from "../../types/PriceHistory";
import PairTitle from "./PairTitle";
import { gql, useQuery } from "@apollo/client";
import getPoolContract from "../helpers/getPoolContract";
import getPoolAddress from "../helpers/getPool";
import { ethers } from "ethers";
import { decodeGetReservesAtTimeRes } from "../helpers/decodeGetReservesAtTimeRes";

interface PriceHistoryProps {
    token0?: TokenTypes;
    token1?: TokenTypes;
    startDate?: Date;
    width?: number | string;
    height?: number | string;
    graphPadding?: number;
    hideTitle?: boolean;
}

const CustomTooltip = ({ payload, token1 }: { payload: any, token1: TokenTypes | undefined }) => {
    return (
        <div className="bg-white/5 rounded-xl">
            <div>
                {payload?.map((pld: { fill: any; value: number; }, index: number) => (
                    // eslint-disable-next-line react/jsx-key
                    <div className="flex flex-col whitespace-nowrap" style={{ display: "inline-block", padding: 10 }}>
                        <p style={{ color: pld.fill }}>{pld.value.toFixed(5)}  {token1?.underlyingToken?.symbol}</p>
                        <p style={{ color: "rgb(255 255 255 / 0.5)" }}>{payload[index].payload.blockTimestamp.toString()}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const PriceChart = ({
    token0,
    token1,
    startDate,
    width,
    height,
    graphPadding,
    hideTitle
}: PriceHistoryProps) => {

    const [currentPrice, setCurrentPrice] = useState<number>(0);

    const currentDate = new Date();

    const totalPeriod = new Date(currentDate.getFullYear() - 1, currentDate.getMonth()).getTime();

    const GET_DATA = gql`
        {
            syncs(first: 500, orderBy: blockTimestamp, orderDirection: asc) {
            id
            reserve0
            reserve1
            blockTimestamp
            }
        }
    `;

    const { error, data } = useQuery(GET_DATA);

    const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
    const minDifferenceRef = useRef(Infinity);
    const [closestDate, setClosestDate] = useState<number>();
    //const closestDate = useRef<number>();
    const [loading, setLoading] = useState(true);
    const periodSelect = useRef<string>('1Y');
    //const [swapStartDisplay, setSwapStartDisplay] = useState<number>();

    async function getPriceAtTime(time: string) {
        if (!token0 || !token1) { return }
            
        const poolAddress = getPoolAddress(token0.address, token1.address);
        const poolContract = getPoolContract(poolAddress);

        if (!poolContract) { return }

        // batch call
        const readOps = [
            poolContract.read.getReservesAtTime([time]), // get reserves
            poolContract.read.token0([]), // get first token in pool
        ];
        const [reserves, poolToken0] = await Promise.all(readOps);

        // decode params
        const decodedReserves = decodeGetReservesAtTimeRes(reserves);

        if (token0.address == poolToken0) {
            return decodedReserves.reserve1 / decodedReserves.reserve0;
        } else {
            return decodedReserves.reserve0 / decodedReserves.reserve1;
        }
    }

    useEffect(() => {
        // fetch current price
        async function fetchCurrentPrice() {
            const time = Math.floor(Date.now() / 1000).toString();
            const price = await getPriceAtTime(time);
            if (price) { 
                setCurrentPrice(price); 
                return price;
            }
        }

        async function formatData() {
            if (!data || !token0 || !token1) { return }

            const currentDate = new Date();

            const timePeriodOptions: { [key: string]: number } = {
                '1H': currentDate.getTime() - (60 * 60 * 1000),
                '1D': currentDate.getTime() - (24 * 60 * 60 * 1000),
                '1W': currentDate.getTime() - (7 * 24 * 60 * 60 * 1000),
                '1M': new Date(currentDate.getFullYear(), currentDate.getMonth() - 1).getTime(),
                '1Y': totalPeriod,
            };

            setClosestDate(undefined);
            minDifferenceRef.current = Infinity;

            // get pool contract
            const poolAddress = getPoolAddress(token0.address, token1.address);
            const poolContract = getPoolContract(poolAddress);

            if (!poolContract) { return }

            // batch call
            const readOps = [
                poolContract.read.token0([]), // get first token in pool
            ];
            const [poolToken0] = await Promise.all(readOps);

            try {
                setLoading(true);
                let currentIndex = -1;
                const newConvertedData: PriceHistory[] = [];

                data.syncs.forEach((item: {
                    blockTimestamp: any;
                    reserve0: { toString: () => string };
                    reserve1: { toString: () => string };
                }) => {
                    const blockTimestamp = new Date(item.blockTimestamp * 1000);

                    const formattedDate = blockTimestamp.toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        hour12: true
                    });

                    if (blockTimestamp.getTime() >= timePeriodOptions[periodSelect.current]) {
                        currentIndex++

                        if (startDate) {
                            const formattedStartDate = Math.floor(startDate.getTime() / 1000).toString();

                            if (item.blockTimestamp === formattedStartDate) {
                                setClosestDate(currentIndex);
                            }
                        }

                        let price;
                        if (token0.address == poolToken0) {
                            price = parseFloat(ethers.utils.formatEther(item.reserve1.toString())) / parseFloat(ethers.utils.formatEther(item.reserve0.toString()));
                        } else {
                            price = parseFloat(ethers.utils.formatEther(item.reserve0.toString())) / parseFloat(ethers.utils.formatEther(item.reserve1.toString()));
                        }

                        const convertedItem: PriceHistory = {
                            ...item,
                            blockTimestamp: formattedDate,
                            token0Price: price,
                        };

                        newConvertedData.push(convertedItem);
                    }
                });

                // if no data, calculate reserves at start of period select and append
                if (newConvertedData.length === 0) {
                    const prevTime = Math.floor(timePeriodOptions[periodSelect.current] / 1000);
                    const formattedPrevDate = new Date(prevTime * 1000).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        hour12: true
                    });
                    const prevPrice = await getPriceAtTime(prevTime.toString());
                    if (prevPrice) {
                        const prevPriceData = { blockTimestamp: formattedPrevDate, token0Price: prevPrice }
                        newConvertedData.push(prevPriceData);
                    }
                }

                // append current price
                const newCurrentPrice = await fetchCurrentPrice();
                const formattedCurrentDate = currentDate.toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true
                });
                const currentPriceData = { blockTimestamp: formattedCurrentDate, token0Price: newCurrentPrice ?? 0 }
                newConvertedData.push(currentPriceData);

                // calculate where the swap starts in the graph
                //const startIndex = closestDate.current ? (closestDate.current > priceHistory.length ? closestDate : 0) : 0; // handle if closestDate out of bounds
                /*setSwapStartDisplay(
                    100 - ((priceHistory.length - startIndex - 1) / (priceHistory.length - 1)) * 100
                );*/

                setPriceHistory(newConvertedData);
                setLoading(false);
            } catch {
                setLoading(false);
            }
        }

        formatData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token0, token1, data, startDate, periodSelect.current]);

    const type = "monotone";

    const swapStartDisplay = 100 - ((priceHistory.length - (closestDate ?? 0) - 1) / (priceHistory.length - 1)) * 100;

    return (
        <div className={`flex items-center justify-center flex-col sm:px-14 2px-8 ${loading ? 'animate-pulse' : ''}`}>
            <PairTitle
                token0={token0}
                token1={token1}
                currentPrice={currentPrice}
                period={periodSelect}
                hideTitle={hideTitle}
            />
            <div 
                className="flex items-center justify-center w-full"
                style={{
                    paddingTop: graphPadding ? graphPadding : '5rem',
                    paddingBottom: graphPadding ? graphPadding : '5rem',
                }}
            >
                <ResponsiveContainer
                    width={width ? width : "100%"}
                    height={height ? height : 250}
                >
                    {
                        priceHistory.length > 0 ?
                        <LineChart
                            data={priceHistory}
                        >
                            <defs>
                                <linearGradient id="graph" x1="0" y1="0" x2="100%" y2="0">
                                    <stop offset="0%" stopColor="#5783F350" />
                                    <stop offset={`${swapStartDisplay}%`} stopColor="#5783F350" />
                                    <stop offset={`${swapStartDisplay}%`} stopColor="#5783F3" />
                                    <stop offset="100%" stopColor="#5783F3" />
                                </linearGradient>
                            </defs>
                            <Line 
                                type={type} 
                                dataKey="token0Price"
                                stroke="url(#graph)"
                                dot={false} 
                                strokeWidth="2px"
                            />
                            {closestDate && (
                                <ReferenceLine
                                    x={closestDate}
                                    stroke="rgb(255 255 255 / 0.15)"
                                    strokeWidth="2px"
                                    strokeDasharray="3 3"
                                >
                                    <Label
                                        stroke="rgb(255 255 255 / 0.15)"
                                        value="Entry"
                                        position="bottom"
                                        offset={10}
                                    />
                                </ReferenceLine>
                            )}
                            <XAxis dataKey="blockTimestamp.getTime()" axisLine={false} tickLine={false} tick={false} />
                            <YAxis /*domain={[minPrice - minExtra, maxPrice + maxExtra]}*/ scale='log' domain={['auto', 'auto']} hide />
                            <Tooltip content={<CustomTooltip payload={undefined} token1={token1} />} />
                        </LineChart> :
                        <></>
                    }
                </ResponsiveContainer>
            </div>
        </div>
    )
}

export default PriceChart;