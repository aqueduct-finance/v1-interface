import React, { MutableRefObject } from "react";
import { TokenTypes } from "../../types/TokenOption";
import Image from "next/image";

interface PairTitleProps {
    token0: TokenTypes | undefined;
    token1: TokenTypes | undefined;
    currentPrice: number;
    period: MutableRefObject<string>;
}

const timeArray = [
    {
        text: "1H"
    },
    {
        text: "1D"
    },
    {
        text: "1W"
    },
    {
        text: "1M"
    },
    {
        text: "1Y"
    },
]

const PairTitle = ({
    token0,
    token1,
    currentPrice,
    period
}: PairTitleProps) => (
    <div className="w-full">
        {token0 && token1 && (
            <div className="flex flex-row justify-between items-end">
                <div className="flex flex-col ml-8 space-y-3">
                    <div className="flex flex-row justify-center items-center">
                        <div className="flex items-center justify-center text-4xl pl-4 space-x-3 font-semibold">
                            <p>{token0.underlyingToken?.symbol}</p>
                            <div className="bg-white/25 w-[0.3rem] h-10 rotate-12 rounded-full" />
                            <p>{token1.underlyingToken?.symbol}</p>
                        </div>
                        <div className="ml-5 flex flex-row">
                            <div className="-mr-3 rounded black-shadow drop z-10">
                                <Image src={token0.logoURI} width="30" height="30" alt={token0.name} />
                            </div>
                            <div className="rounded drop-shadow-lg">
                                <Image src={token1.logoURI} width="30" height="30" alt={token1.name} />
                            </div>
                        </div>
                    </div>
                    <div className="w-min whitespace-nowrap flex items-center justify-center rounded-xl p-2 px-4 ml-3 bg-item text-white/50 space-x-2 font-medium">
                        <p>
                            1 {token0.underlyingToken?.symbol}
                        </p>
                        <p>
                            =
                        </p>
                        <p>
                            {currentPrice.toFixed(3)} {token1.underlyingToken?.symbol}
                        </p>
                    </div>
                </div>
                <div className="flex mr-12 p-1 space-x-1">
                    {timeArray.map((item, i) => (
                        <div className={`${period.current === item.text ? "bg-item text-white" : "bg-transparent text-white/50"} py-1 px-1 flex items-center justify-center rounded-xl w-[40px] cursor-pointer duration-100 ease-in-out`}
                            key={i}
                            onClick={() => {
                                period.current = item.text;
                            }}
                        >
                            <h1 className="rounded-full font-semibold">{item.text}</h1>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
)

export default PairTitle;