import React, { useState } from "react";
import { IoClose, IoMenu } from "react-icons/io5";
import WalletConnectButton from "./WalletConnect";
import { motion, Variants } from "framer-motion";
import { ConnectKitButton } from "connectkit";

declare global {
    interface Window {
        Ethereum: any
    }
}

const navBarVariants: Variants = {
    offscreen: {
        y: 50,
        opacity: 0,
        scale: 0.9,
    },
    onscreen: {
        y: 0,
        opacity: 1,
        scale: 1,
        transition: {
            type: "spring",
            bounce: 0.2,
            duration: 1.5,
            delay: 1
        }
    }
};

function NavBar() {
    const [isOpen, setIsOpen] = useState(false);


    return (
        <div className="w-full flex justify-center sticky top-0 z-50 backdrop-blur-xl pixel-blur">
        <div
            className={`max-w-screen-2xl 2bg-red-500 flex w-full text-aqueductBlue p-4 lg:px-8 lg:pt-6 lg:pb-4 overflow-hidden ${isOpen ? "flex-col lg:flex-row" : "flex-row"
                }`}
        >
            <div className="flex w-full items-center space-x-2 lg:space-x-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="/aq-logo.png"
                    alt="Aqueduct logo"
                    className="w-10 h-10 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl"
                />
                <h1
                    className="text-2xl font-semibold pr-2 lg:pr-3 poppins-font"
                >
                    aqueduct
                </h1>
                <div className="flex grow" />
                <div className="md:hidden mt-[3px]">
                    <button
                        type="button"
                        className="md:hidden mb-[3px]"
                        onClick={() => {
                            setIsOpen(!isOpen);
                        }}
                    >
                        {isOpen ? <IoClose size={28} /> : <IoMenu size={28} />}
                    </button>
                </div>
            </div>
            <div
                className={`${isOpen ? "flex flex-col space-y-4 pt-4" : "hidden"
                    } md:flex md:flex-row md:space-y-0 md:pt-0 md:space-x-3`}
            >
                {/*<WalletConnectButton />*/}
                <ConnectKitButton />
            </div>
        </div>
        </div>
    );
}

export default NavBar;