import React from "react";
import { useRouter } from "next/router";
import { NavItem } from "../types/NavItems";

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
            type="button"
            className={`flex rounded-xl whitespace-nowrap min-w-[8rem] ${expand ? 'grow' : ''}`}
            style={{ flex: "1 1 0px" }}
            onClick={() => {
                handleNavClick();
            }}
        >
            <div
                className={`${router.asPath
                    === options.page ?
                    "2bg-highlightedItem bg-white/5 text-white border-[1px] border-white/5 rounded-xl" : "bg-transparent border-0 border-transparent text-accentText"} 
                w-full flex items-center justify-center 2rounded-2xl px-12 py-3 font-semibold neuehaas-font hover:text-white transition-all duration-300`}>
                <h1>
                    {options.label}
                </h1>
            </div>
        </button>
    )
}

export default NavOption;