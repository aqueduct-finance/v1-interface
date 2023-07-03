import React from 'react'

interface DetailRowProps {
    title: string;
    data: string;
    index: number;
}

const DetailRow = ({
    title,
    data,
    index
}: DetailRowProps) => (
    <div className='w-full flex flex-row items-start space-x-4 text-sm'>
        <p className='text-accentText text-xs'>
            {title}
        </p>
        <p className='text-xs'>
            {data}
        </p>
    </div>
)

export default DetailRow;