import { BigNumber } from 'ethers';
import React from 'react'
import { TokenTypes } from '../../types/TokenOption';
import DetailRow from './DetailRow';
import { ethers } from 'ethers';

interface DetailsDisplayProps {
    startDate: Date | undefined;
    endDate: Date | undefined;
    flowrate0: BigNumber;
    txHash: string;
    token0: TokenTypes;
}

const DetailsDisplay = ({
    startDate,
    endDate,
    flowrate0,
    txHash,
    token0
}: DetailsDisplayProps) => {

    const testTx = "0x9084Fe34F3CB7A265f590e13908c9a38648A37BF"

    const actualEndDate = endDate === undefined ? "Not Scheduled" : startDate?.toLocaleDateString() + "\u00A0\u00A0\u00A0" + startDate?.toLocaleTimeString();

    const streamData = [
        { title: "Start Date: ", data: startDate?.toLocaleDateString() + "\u00A0\u00A0\u00A0" + startDate?.toLocaleTimeString() },
        { title: "End Date: ", data: actualEndDate },
        { title: `${token0?.symbol} Flowrate: `, data: "-" + parseFloat(ethers.utils.formatEther(flowrate0)).toFixed(11) + "\u00A0" + " / " + "\u00A0" + "sec" },
        { title: "TX Hash: ", data: `${testTx.slice(0, 6)}...${testTx.slice(-4)}` },
    ]

    return (
        <div className='w-full h-full rounded-l-[1.4rem] rounded-r-xl bg-item text-white flex flex-col items-start justify-start px-6 py-4'>
            <h1 className='font-medium text-accentText'>
                Details
            </h1>
            <div className='space-y-3 mt-4'>
                {streamData.map((data, i) => (
                    <DetailRow
                        title={data.title}
                        data={data.data}
                        index={i}
                        key={i}
                    />
                ))}
            </div>
        </div>
    )
}

export default DetailsDisplay;