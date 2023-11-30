import { IoChevronDown } from "react-icons/io5";
import { useStore } from "../store";
import Image from 'next/image';
import { Dispatch, RefObject, SetStateAction, useEffect, useRef, useState } from "react";
import { chainsById, chainsList } from "../utils/chains";
import { FaCheck } from "react-icons/fa6";
import { switchNetwork, getNetwork } from '@wagmi/core';
import { useChainId } from "wagmi";

const ChainDropdownButton = () => {

    const store = useStore();

    const [open, setOpen] = useState<boolean>(false);

    const ref = useRef<HTMLButtonElement>(null);

    const chainId = useChainId();

    // when wallet's selected chain manually changes, update store
    useEffect(() => {
        if (chainId) {
            store.setChain(chainsById[chainId]);
        }
    }, [chainId])

    return (
        <div className="md:relative">
            <button 
                className="flex 2w-[4.5rem] pl-2 pr-3 h-10 rounded-xl items-center justify-center space-x-3 bg-[#272727] hover:bg-[#404040] transition-all duration-150"
                onClick={() => {
                    setOpen(!open);
                }}
                ref={ref}
            >
                {store.chain.logo}
                <IoChevronDown 
                    className="flex-shrink-0"
                    size={15}
                />
            </button>
            <ChainDropdown 
                open={open}
                setOpen={setOpen}
                parentRef={ref}
            />
        </div>
    )
}

interface ChainDropdown {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    parentRef: RefObject<HTMLButtonElement>;
}

const ChainDropdown = ({open, setOpen, parentRef}: ChainDropdown) => {

    const store = useStore();
    const ref = useRef<HTMLDivElement>(null);

    const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        if (ref.current && parentRef.current && !ref.current.contains(target) && !parentRef.current.contains(target)) {
            setOpen(false);
        }
    };

    useEffect(() => {
        if (open) {
            // Attach the event listener
            document.addEventListener("mousedown", handleClickOutside);

            // Clean up
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }
    }, [open]);

    if (!open) {return;}

    return (
        <div className="absolute top-full bottom-0 left-0 right-0 md:left-auto md:pt-3">
            <div 
                className="w-full md:w-64 bg-[#202020] border-2 border-[#272727] p-2 md:rounded-2xl space-y-2"
                ref={ref}
            >
                {
                    chainsList.map((c) => {
                        return (
                            <button 
                                className="rounded-lg w-full flex justify-between items-center px-3 py-3 hover:bg-[#272727]"
                                onClick={async () => {
                                    // if this network is already selected, return
                                    if (c.chainId === store.chain.chainId) { return; }

                                    // if wallet isn't connected, go ahead and switch network
                                    const { chain } = getNetwork();
                                    if (!chain) {
                                        store.setChain(c);
                                        setOpen(false);
                                        return;
                                    }

                                    // otherwise, request wallet to switch network first
                                    try {
                                        await switchNetwork({
                                            chainId: c.chainId
                                        });
                                        store.setChain(c);
                                        setOpen(false);
                                    } catch {}
                                }}
                            >
                                <div className="flex space-x-4">
                                    {c.logo}
                                    <p className="">
                                        {c.name}
                                    </p>
                                </div>
                                {
                                    c.chainId === store.chain.chainId &&
                                    <FaCheck 
                                        className="text-"
                                    />
                                }
                            </button>
                        )
                    })
                }
            </div>
        </div>
    )   
}

export default ChainDropdownButton;