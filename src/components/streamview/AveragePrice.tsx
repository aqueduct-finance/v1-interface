import React from 'react'
import { TokenTypes } from '../../types/TokenOption';

interface AveragePriceProps {
    token0: TokenTypes;
    token1: TokenTypes;
    price: number;
}

const AveragePrice = ({
    token0,
    token1,
    price
}: AveragePriceProps) => (
    <div className='w-full grow rounded-l-xl rounded-r-[1.4rem] bg-item text-accentText font-semibold flex flex-col items-start justify-start px-6 py-4'>
        <h1 className='font-medium'>
            Average Price
        </h1>
        <div className='flex flex-col grow justify-end text-3xl space-y-1 text-white/80'>
            <h1>
                1 {token0.underlyingToken?.symbol}
            </h1>
            <h1>
                {`= ${price} ${token1.underlyingToken?.symbol}`}
            </h1>
        </div>
    </div>
)

export default AveragePrice;