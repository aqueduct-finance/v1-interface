import { ethers, BigNumber } from 'ethers';
import React, { useEffect, useState } from 'react'
import { TokenTypes } from '../../types/TokenOption';
import DetailRow from './DetailRow';
import { useAccount } from 'wagmi';
import getPoolAddress from '../helpers/getPool';

interface DetailsDisplayProps {
    startDate: Date | undefined;
    endDate: Date | undefined;
    flowrate0: BigNumber;
    token1: TokenTypes;
    token0: TokenTypes;
}

interface StreamData {
    title: string;
    data: string;
    link?: string;
}

const DetailsDisplay = ({
    startDate,
    endDate,
    flowrate0,
    token1,
    token0
}: DetailsDisplayProps) => {
    const { address } = useAccount();

    const [streamData, setStreamData] = useState<StreamData[]>();
    useEffect(() => {
        async function getStreamData() {
            const poolAddress = await getPoolAddress(token0?.address, token1?.address);
            const superfluidDashboardLink = `https://app.superfluid.finance/stream/polygon-mumbai/${address}-${poolAddress ?? ''}-${token0?.address}`

            const data = [
                { title: "Start Date: ", data: startDate?.toLocaleDateString() + "\u00A0\u00A0\u00A0" + startDate?.toLocaleTimeString() },
                { title: "End Date: ", data: "Not Scheduled" },
                { title: `${token0?.symbol} Flowrate: `, data: "-" + parseFloat(ethers.utils.formatEther(flowrate0)).toFixed(11) + "\u00A0" + " / " + "\u00A0" + "sec" },
                { title: "Data: ", data: `${superfluidDashboardLink.slice(8, 12)}...${superfluidDashboardLink.slice(-4)}`, link: superfluidDashboardLink },
            ]
            setStreamData(data);
        }

        getStreamData();
    }, [])

    return (
        <div className='max-w-xl w-full h-full rounded-2xl md:rounded-bl-[2.4rem] bg-white/5 text-white flex flex-col items-start justify-start px-8 py-6'>
            <h1 className='font-medium text-accentText'>
                Details
            </h1>
            <div className='space-y-3 mt-4'>
                {
                    streamData && streamData.map((data, i) => (
                        <DetailRow
                            title={data.title}
                            data={data.data}
                            link={data.link}
                            index={i}
                            key={i}
                        />
                    ))
                }
            </div>
        </div>
    )
}

export default DetailsDisplay;