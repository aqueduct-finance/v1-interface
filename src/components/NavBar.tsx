import React, { useState } from "react";
import { IoClose, IoMenu } from "react-icons/io5";
import { ConnectKitButton } from "connectkit";
import NavOption from "./NavOption";
import NavLink from "./NavLink";

declare global {
    interface Window {
        Ethereum: any
    }
}

const navItems: { label: string; page: string }[] = [
    {
        label: "My Swaps",
        page: "/my-swaps",
    },
    {
        label: "Swap",
        page: "/",
    },
];

function NavBar() {
    const [isOpen, setIsOpen] = useState(false);


    return (
        <div className="w-full flex justify-center sticky top-0 z-50 backdrop-blur-xl pixel-blur">
            <div
                className={`max-w-screen-2xl 2bg-red-500 flex w-full text-aqueductBlue p-4 lg:px-8 justify-between lg:pt-6 lg:pb-4 overflow-hidden ${isOpen ? "flex-col lg:flex-row" : "flex-row"
                    }`}
            >
                <div className="flex w-full items-center space-x-2 lg:space-x-3 justify-between">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/aqueduct-logo.png"
                        alt="Aqueduct logo"
                        className="w-10 h-10 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl"
                    />
                    <h1
                        className="text-2xl font-semibold pr-2 lg:pr-3 poppins-font"
                    >
                        aqueduct
                    </h1>
                    <div className="flex grow" />
                    <div
                        className="rounded-2xl bg-item md:flex flex-row hidden items-center justify-center p-2 space-x-2"
                    >
                        {navItems.map((item, i) => (
                            <NavOption
                                options={item}
                                key={i}
                            />
                        ))}
                    </div>
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
                    <div
                        className="rounded-2xl bg-item md:hidden flex-col items-center justify-center p-2 space-y-1"
                    >
                        <NavLink
                            title="My Swaps"
                            link="/my-swaps"
                        />
                        <NavLink
                            title="Swap"
                            link="/"
                        />
                        <div className="w-full flex items-center justify-center p-2">
                            <ConnectKitButton />
                        </div>
                    </div>
                    <div className="w-full md:flex hidden items-center justify-center p-2">
                        <ConnectKitButton />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NavBar;