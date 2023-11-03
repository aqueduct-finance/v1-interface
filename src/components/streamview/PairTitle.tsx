import React, { MutableRefObject } from "react";
import { TokenTypes } from "../../types/TokenOption";
import Image from "next/image";

interface PairTitleProps {
    token0: TokenTypes | undefined;
    token1: TokenTypes | undefined;
    currentPrice: number;
    period: MutableRefObject<string>;
    hideTitle?: boolean;
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
    period,
    hideTitle
}: PairTitleProps) => (
    <div className="w-full">
        {token0 && token1 && (
            <div className="flex flex-col space-y-3">
                {
                    !hideTitle &&
                    <div className="flex flex-row items-center">
                        <div className="flex items-center justify-center text-4xl space-x-3 font-semibold">
                            <p>{token0.underlyingToken?.symbol}</p>
                            <div className="bg-white/25 w-[0.3rem] h-10 rotate-12 rounded-full" />
                            <p>{token1.underlyingToken?.symbol}</p>
                        </div>
                        <div className="ml-5 flex flex-row">
                            <div className="-mr-3 rounded black-shadow drop z-10 ">
                                <Image src={token0.logoURI} width="30" height="30" alt={token0.name} />
                            </div>
                            <div className="rounded drop-shadow-lg">
                                <Image src={token1.logoURI} width="30" height="30" alt={token1.name} />
                            </div>
                        </div>
                    </div>
                }
                <div className="flex flex-row justify-between items-center">
                    
                    <div className="text-xs md:text-base w-min whitespace-nowrap flex items-center justify-center rounded-xl p-2 px-4 bg-white/5 text-white/50 space-x-2 font-medium">
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
                    <div className="text-xs md:text-base flex space-x-1">
                        {timeArray.map((item, i) => (
                            <div className={`${period.current === item.text ? "bg-aqueductBlue/50 outline outline-2 outline-aqueductBlue text-white" : "bg-transparent text-white/50"} py-1 px-2 flex items-center justify-center rounded-xl cursor-pointer duration-100 ease-in-out`}
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
            </div>
        )}
    </div>
)

export default PairTitle;