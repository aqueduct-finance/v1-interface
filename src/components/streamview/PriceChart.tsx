import React, { MutableRefObject } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, Label, ResponsiveContainer } from 'recharts';
import { TokenTypes } from "../../types/TokenOption";
import { PriceHistory } from "../../types/PriceHistory";
import PairTitle from "./PairTitle";

interface PriceHistoryProps {
    priceHistory: PriceHistory[];
    entry: number | null;
    token0: TokenTypes | undefined;
    token1: TokenTypes | undefined;
    currentPrice: number;
    loading: boolean;
    period: MutableRefObject<string>;
}

const CustomTooltip = ({ payload, token1 }: { payload: any, token1: TokenTypes | undefined }) => {
    return (
        <div className="bg-item rounded-xl">
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
    priceHistory,
    entry,
    token0,
    token1,
    currentPrice,
    loading,
    period
}: PriceHistoryProps) => {
    const type = "monotone";

    const prices = priceHistory.map((item) => item.token0Price);

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    const actualEntry = entry ? entry : 0;

    const minExtra = minPrice * .5;
    const maxExtra = maxPrice * .5;

    const swapStartDisplay = 100 - ((priceHistory.length - actualEntry - 1) / (priceHistory.length - 1)) * 100;

    return (
        <div className={`flex items-start justify-center flex-col py-8 sm:pl-5 pl-0 mt-5 ${loading ? 'animate-pulse' : ''}`}>
            <PairTitle
                token0={token0}
                token1={token1}
                currentPrice={currentPrice}
                period={period}
            />
            <ResponsiveContainer
                width="90%"
                height={400}
            >
                {
                    priceHistory.length > 0 ?
                    <LineChart
                        width={800}
                        height={400}
                        data={priceHistory}
                        margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                    >
                        <defs>
                            <linearGradient id="graph" x1="0" y1="0" x2="100%" y2="0">
                                <stop offset="0%" stopColor="#17203D" />
                                <stop offset={`${swapStartDisplay}%`} stopColor="#17203D" />
                                <stop offset={`${swapStartDisplay}%`} stopColor="#5783F3" />
                                <stop offset="100%" stopColor="#5783F3" />
                            </linearGradient>
                        </defs>
                        <Line 
                            type={type} 
                            dataKey="token0Price" 
                            stroke={`${swapStartDisplay === Infinity ? "#5783F3" : "url(#graph)"}`} 
                            dot={false} 
                            strokeWidth="2px"
                        />
                        {entry && (
                            <ReferenceLine
                                x={actualEntry}
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
                        <YAxis domain={[minPrice - minExtra, maxPrice + maxExtra]} axisLine={false} tickLine={false} tick={false} />
                        <Tooltip content={<CustomTooltip payload={undefined} token1={token1} />} />
                    </LineChart> :
                    <></>
                }
            </ResponsiveContainer>
        </div>
    )
}

export default PriceChart;