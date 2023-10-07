import type { NextPage } from 'next'
import TWAMMWidget from 'aqueduct-widget';
import React from 'react';
import theme from '../styles/theme';

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

    return (
        <div className='md:w-[26rem] md:pt-16 pb-32'>
            <div 
                className='w-full h-full md:shadow-2xl'
                style={
                    {borderRadius: theme.primaryBorderRadius}
                }
            >
                <TWAMMWidget
                    tokenOption={tokens}
                    theme={theme}
                />
            </div>
        </div>
    )
}

export default Home;
