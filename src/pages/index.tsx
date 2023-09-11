import type { NextPage } from 'next'
import TWAMMWidget from 'aqueduct-widget';
import React from 'react';
import 'aqueduct-widget/styles';

const Home: NextPage = () => {
    return (
        <div className='md:w-[26rem] md:pt-16 pb-32'>
            <TWAMMWidget />
        </div>
    )
}

export default Home
