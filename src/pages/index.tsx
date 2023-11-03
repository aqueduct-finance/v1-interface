import type { NextPage } from 'next'
import TWAMMWidget from 'aqueduct-widget';
import React, { useState } from 'react';
import theme from '../styles/theme';
import PriceChart from '../components/streamview/PriceChart';
//import { useStore } from '../store';
import { useWidgetStore } from 'aqueduct-widget';
import { useModal } from "connectkit";
import getPoolAddress from '../components/helpers/getPool';
import { CgArrowsExpandRight } from "react-icons/cg";
import { PiArrowsInSimpleBold } from "react-icons/pi";

const Home: NextPage = () => {

    const tokens = [
        {
            name: "USD Coin",
            address: "0x42bb40bF79730451B11f6De1CbA222F17b87Afd7" as `0x${string}`,
            symbol: "USDCx",
            decimals: 18,
            underlyingToken: {
                name: "USD Coin",
                address: "0xbe49ac1EadAc65dccf204D4Df81d650B50122aB2" as `0x${string}`,
                symbol: "USDC",
                decimals: 18,
                logoURI: "/usdc-logo.png",
            },
            logoURI: "/usdc-logo.png",
        },
        {
            name: "DAI Stablecoin",
            address: "0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f" as `0x${string}`,
            symbol: "DAIx",
            decimals: 18,
            underlyingToken: {
                name: "DAI Stablecoin",
                address: "0x15F0Ca26781C3852f8166eD2ebce5D18265cceb7" as `0x${string}`,
                symbol: "DAI",
                decimals: 18,
                logoURI: "/dai-logo.png",
            },
            logoURI: "/dai-logo.png",
        },
    ];

    const [isGraphOpen, setIsGraphOpen] = useState(false);
    const store = useWidgetStore();
    
    const connectkitModal = useModal();

    const checkTokens = () => {
        return store.outboundToken && store.inboundToken && getPoolAddress(store.outboundToken.address, store.inboundToken.address);
    }
    
    return (
        <div className='flex flex-col 2xl:flex-row 2xl:space-x-8 w-full items-center 2xl:justify-center'>
            <div className='md:w-[26rem] md:pt-16 pb-32'>
                <div className='2xl:hidden w-full p-3 pb-8'>
                    <button
                        className='flex items-center px-4 py-3 justify-between bg-white/5 w-full rounded-2xl text-xs text-white/50 font-medium disabled:opacity-50'
                        onClick={() => {setIsGraphOpen(true)}}
                        disabled={checkTokens() ? false : true}
                    >
                        <div className=''>
                            Show price history
                        </div>
                        <CgArrowsExpandRight />
                    </button>
                </div>
                <div 
                    className='w-full h-full md:shadow-2xl'
                    style={
                        {borderRadius: theme.primaryBorderRadius}
                    }
                >
                    <TWAMMWidget
                        tokenOption={tokens}
                        theme={theme}
                        onConnectWalletClick={() => {connectkitModal.setOpen(true)}}
                    />
                </div>
            </div>
            <div 
                className={`${isGraphOpen ? 'absolute top-0 bottom-0 flex flex-col items-center justify-center' : 'hidden 2xl:block'} 2xl:static bg-[#0A101F] 2xl:bg-transparent z-10 2xl:transition-all 2xl:duration-1000 overflow-hidden ${checkTokens() ? 'w-full max-w-full px-6 2xl:px-0 2xl:max-w-[50rem]' : 'max-w-0'}`}
            >
                <button
                    className='flex space-x-2 items-center justify-center absolute top-20 right-6 md:top-32 md:right-16 2xl:hidden rounded-2xl text-xs text-white/50 font-medium bg-white/5 py-2 px-4 border-[1px] border-white/10'
                    onClick={() => {setIsGraphOpen(false)}}
                >
                    <div>
                        Hide
                    </div>
                    <PiArrowsInSimpleBold />
                </button>
                <div className='w-full 2xl:w-[50rem]'>
                    {
                        checkTokens() &&
                        <PriceChart 
                            token0={store.outboundToken}
                            token1={store.inboundToken}
                            height={250}
                            hideTitle
                        />
                    }
                </div>
            </div>
        </div>
    )
}

export default Home;
