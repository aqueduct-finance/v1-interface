import React from "react";
import { NavItem } from "../types/NavItems";
import { useRouter } from "next/router";

interface NavOptionProps {
    options: NavItem;
    expand?: boolean;
}

const NavOption = ({
    options,
    expand
}: NavOptionProps) => {
    const router = useRouter()

    const handleNavClick = async () => {
        if (options.page) {
            router.push(options.page)
        }
    }

    return (
        <button
            className={`flex rounded-xl whitespace-nowrap min-w-[8rem] ${expand ? 'grow' : ''}`}
            style={{ flex: "1 1 0px" }}
            onClick={() => {
                handleNavClick();
            }}
        >
            <div
                className={`${router.asPath
                    === options.page ?
                    "bg-highlightedItem text-white" : "bg-transparent text-accentText"} 
                w-full flex items-center justify-center rounded-2xl px-3 py-2 font-semibold`}>
                <h1>
                    {options.label}
                </h1>
            </div>
        </button>
    )
}

export default NavOption;