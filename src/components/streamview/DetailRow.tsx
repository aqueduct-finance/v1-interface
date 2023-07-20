import React, { useRef } from 'react'
import {
    BiCopy,
    BiLinkExternal,
    BiCheck
}
    from 'react-icons/bi'

interface DetailRowProps {
    title: string;
    data: string;
    index: number;
    link: string | undefined;
}

const DetailRow = ({
    title,
    data,
    link,
    index
}: DetailRowProps) => {
    const isCopied = useRef<boolean>(false)

    const handleCopy = () => {
        if (link) {
            navigator.clipboard.writeText(link)
            isCopied.current = true;

            setTimeout(() => {
                isCopied.current = false;
            }, 1500)
        }
    }

    return (
        <div className='flex flex-row items-start space-x-4 text-sm'>
            <p className='text-accentText text-xs'>
                {title}
            </p>
            <p className='text-xs'>
                {data}
            </p>
            {title === "Data: " && (
                <div className='flex justify-center items-center cursor-pointer space-x-2'>
                    {isCopied.current ? (
                        <BiCheck
                            width={35}
                            height={35}
                            className='text-green-500'
                        />
                    ) : (
                        <BiCopy
                            width={20}
                            height={20}
                            className='text-accentText hover:text-white'
                            onClick={handleCopy}
                        />
                    )}
                    <a href={`${link}`} >
                        <BiLinkExternal width={20} height={20} className='text-accentText hover:text-white' />
                    </a>
                </div>
            )}
        </div>
    )
}

export default DetailRow;