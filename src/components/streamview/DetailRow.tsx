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
        <p className='text-accentText'>
            {title}
        </p>
        <p>
            {data}
        </p>
    </div>
)

export default DetailRow;