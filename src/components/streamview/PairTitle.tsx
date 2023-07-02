import React from "react";
import { TokenTypes } from "../../types/TokenOption";
import Image from "next/image";

interface PairTitleProps {
    token0: TokenTypes | undefined;
    token1: TokenTypes | undefined;
    currentPrice: number;
}

const PairTitle = ({
    token0,
    token1,
    currentPrice,
}: PairTitleProps) => (
    <div>
        {token0 && token1 && (
            <div className="flex flex-col ml-8 space-y-3">
                <div className="flex flex-row justify-center items-center">
                    <div className="flex items-center justify-center text-4xl pl-4 space-x-1 monospace-font font-medium">
                        <p>{token0.underlyingToken?.symbol}</p>
                        <p className="text-accentText text-5xl mb-2 font-normal"> / </p>
                        <p>{token1.underlyingToken?.symbol}</p>
                    </div>
                    <div className="ml-5 flex flex-row">
                        <div className="-mr-2 rounded drop-shadow-lg">
                            <Image src={token0.logoURI} className="z-10 " width="40" height="40" alt="Jeff" />
                        </div>
                        <div className="rounded drop-shadow-lg">
                            <Image src={token1.logoURI} width="40" height="40" alt="Bob" />
                        </div>
                    </div>
                </div>
                <div className="w-2/3 flex items-center justify-center rounded-xl p-3 ml-3 bg-item text-white/80 space-x-2">
                    <p>
                        1 {token0.underlyingToken?.symbol}
                    </p>
                    <p>
                        =
                    </p>
                    <p>
                        {currentPrice.toFixed(2)} {token1.underlyingToken?.symbol}
                    </p>
                </div>
            </div>
        )}
    </div>
)

export default PairTitle;