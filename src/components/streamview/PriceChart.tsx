import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, Label } from 'recharts';
import { TokenTypes } from "../../types/TokenOption";
import { PriceHistory } from "../../types/PriceHistory";
import PairTitle from "./PairTitle";

interface PriceHistoryProps {
    priceHistory: PriceHistory[];
    entry: number | null;
    token0: TokenTypes | undefined;
    token1: TokenTypes | undefined;
    currentPrice: number;
}

const CustomTooltip = ({ payload, token1 }: { payload: any, token1: TokenTypes | undefined }) => {
    return (
        <div className="bg-item rounded-xl">
            <div>
                {payload.map((pld: { fill: any; value: number; }) => (
                    // eslint-disable-next-line react/jsx-key
                    <div className="flex flex-row whitespace-nowrap" style={{ display: "inline-block", padding: 10 }}>
                        <p style={{ color: pld.fill }}>{pld.value.toFixed(5)}  {token1?.underlyingToken?.symbol}</p>
                    </div>
                ))}
            </div>
        </div>
    );

    return null;
};

const PriceChart = ({
    priceHistory,
    entry,
    token0,
    token1,
    currentPrice
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
        <div className="flex items-start justify-center flex-col py-12 pl-5 mt-10">
            <PairTitle
                token0={token0}
                token1={token1}
                currentPrice={currentPrice}
            />
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
                <Line type={type} dataKey="token0Price" stroke="#5783F3" dot={false} strokeWidth="2px" />
                <ReferenceLine x={actualEntry} stroke="rgb(255 255 255 / 0.5)" strokeWidth="2px" >
                    <Label
                        stroke="rgb(255 255 255 / 0.5)"
                        value="Entry"
                        position="bottom"
                        offset={10}
                    />
                </ReferenceLine>
                <XAxis dataKey="blockTimestamp.getTime()" axisLine={false} tickLine={false} tick={false} />
                <YAxis domain={[minPrice - minExtra, maxPrice + maxExtra]} axisLine={false} tickLine={false} tick={false} />
                <Tooltip content={<CustomTooltip payload={undefined} token1={token1} />} />
            </LineChart>
        </div>
    )
}

export default PriceChart;