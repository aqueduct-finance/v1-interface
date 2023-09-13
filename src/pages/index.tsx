import type { NextPage } from 'next'
import TWAMMWidget from 'aqueduct-widget';
import React from 'react';
import 'aqueduct-widget/styles';
import theme from '../styles/theme';

const Home: NextPage = () => {

    return (
        <div className='md:w-[26rem] md:pt-16 pb-32'>
            <div 
                className='w-full h-full md:shadow-2xl'
                style={
                    {borderRadius: theme.primaryBorderRadius}
                }
            >
                <TWAMMWidget
                    theme={theme}
                />
            </div>
        </div>
    )
}

export default Home
