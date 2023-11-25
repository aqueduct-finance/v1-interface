import { BigNumber, ethers } from "ethers";
import Image from "next/image";
import { TokenTypes } from "../types/TokenOption";

interface BalanceFieldProps {
    currentBalance: BigNumber;
    isTwap: boolean;
    token: TokenTypes;
    numDecimals: number;
    isLoading: boolean;
    customText?: string;
    customLogo?: string;
}

const BalanceField = ({
    currentBalance,
    isTwap,
    token,
    numDecimals,
    isLoading,
    customText,
    customLogo
}: BalanceFieldProps) => {
    if (isLoading) {
        return (
            <div className="bg-gray-200 dark:bg-gray-800 h-10 rounded-2xl animate-pulse" />
        );
    }

    return (
        <div
            className={
                `flex rounded-2xl justify-center tracking-wider monospace-font ${
                    customText ?
                    customText : (
                        isTwap
                        ? `font-bold space-x-4 items-end text-white dark:text-white/90 ${currentBalance.gt('1000000000000000000000000') ? "text-3xl lg:text-4xl xl:text-5xl" : "text-3xl md:text-4xl lg:text-5xl xl:text-7xl"}`
                        : `font-bold space-x-4 items-end text-accentText dark:text-slate-500/80 ${currentBalance.gt('1000000000000000000000000') ? "text-xl lg:text-3xl xl:text-4xl" : "text-xl md:text-2xl lg:text-3xl xl:text-5xl font-semibold"}`
                    )
                }`
            }
        >
            <p>
                {(isTwap ? "+" : "-") +
                    parseFloat(ethers.utils.formatEther(currentBalance)).toLocaleString(
                        undefined,
                        {
                            minimumFractionDigits: numDecimals >= 0 ? numDecimals : 0,
                        }
                    )}
            </p>
            <div className="flex space-x-1 md:space-x-2">
                <div className={`relative ${customLogo ? customLogo : 'h-4 w-4 md:h-6 md:w-6 xl:h-7 xl:w-7 xl:mb-2'}`}>
                    <Image src={token.logoURI} layout="fill" alt="none" />
                </div>
            </div>
        </div>
    );
};

export default BalanceField;