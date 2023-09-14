import React, { useState } from "react";
import Image from "next/image";
import { IoClose, IoMenu } from "react-icons/io5";
import { ConnectKitButton } from "connectkit";
import NavOption from "./NavOption";
import NavLink from "./NavLink";
import theme from "../styles/theme";

declare global {
    interface Window {
        ethereum: ExplicitAny;
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
        <>
            <div className="w-full flex justify-center sticky top-0 z-50 backdrop-blur-xl 2pixel-blur bg-black/20">
                <div
                    className={`max-w-screen-2xl flex w-full items-center justify-between px-4 py-2 md:px-6 md:pt-4 md:pb-2 lg:px-8 lg:pt-6 lg:pb-4 overflow-hidden`}
                >
                    
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/aqueduct-logo.png"
                            alt="Aqueduct logo"
                            className="w-8 h-8 object-contain lg:w-9 lg:h-9 rounded-lg lg:rounded-xl"
                        />
                        <h1
                            className="text-3xl px-2 lg:px-2 garamond-font text-white tracking-tight"
                        >
                            Aqueduct
                        </h1>
                        <div className="w-full" />
                        <div
                            className="rounded-xl 2bg-item bg-white/ md:flex flex-row hidden items-center justify-center"
                        >
                            {navItems.map((item, i) => (
                                <NavOption
                                    options={item}
                                    key={i}
                                />
                            ))}
                        </div>
                        <div className="w-full" />
                        <ConnectKitButton />
                </div>
            </div>

            {/* Display a bottom-aligned tab bar on mobile */}
            <div 
                className="md:hidden fixed bottom-2 left-2 right-2 h-14 p-1 flex flex-row items-center justify-center space-x-2 z-50 backdrop-blur-3xl rounded-2xl"
                style={{
                    backgroundColor: theme.bgColor
                }}
            >
                {navItems.map((item, i) => (
                    <NavOption
                        expand
                        options={item}
                        key={i}
                    />
                ))}
            </div>
        </>
    );
}

export default NavBar;
