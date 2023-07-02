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
    <div className='w-full h-full rounded-xl bg-item text-accentText font-semibold flex flex-col items-start justify-start px-6 py-4'>
        <h1 className='font-semibold text-lg'>
            Average Price
        </h1>
        <div className='space-y-3 mt-6 text-4xl'>
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