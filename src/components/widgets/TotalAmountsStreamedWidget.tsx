/* eslint-disable radix */
import { BigNumber } from "ethers";
import { TokenTypes } from "../../types/TokenOption";
import BalanceField from "../BalanceField";
import DetailsDisplay from "../streamview/DetailsDisplay";
import AveragePrice from "../streamview/AveragePrice";
import Image from 'next/image';
import { useRouter } from "next/router";
import RetrieveFundsState from "../../types/RetrieveFundsState";

interface TotalAmountsStreamedWidgetProps {
    flowRate0: BigNumber;
    twapFlowRate1: BigNumber;
    currentBalance0: BigNumber;
    token0: TokenTypes;
    token1: TokenTypes;
    currentTwapBalance1: BigNumber;
    isLoading: boolean;
    startDate: Date | undefined;
    endDate: Date | undefined;
    price: number;
    poolAddress: string | undefined;
}

const TotalAmountsStreamedWidget = ({
    flowRate0,
    twapFlowRate1,
    currentBalance0,
    token0,
    token1,
    currentTwapBalance1,
    isLoading,
    startDate,
    endDate,
    price,
    poolAddress
}: TotalAmountsStreamedWidgetProps) => {
    const getNumerOfDecimals = (flowRate: BigNumber) => {
        const flowRateDigitCount = flowRate.toString().length;
        const firstDigit = parseInt(flowRate.toString()[0]);
        const oneOrZero = firstDigit > 5 ? 1 : 0;

        return 19 - flowRateDigitCount - oneOrZero;
    };

    const router = useRouter();

    return (
        <div className="md:space-y-6 lg:space-y-10">
            <div className="sm:space-y-4 space-y-2 md:pb-0 pb-6 flex flex-col">
                {flowRate0.gt(0) && (
                    <BalanceField
                        currentBalance={currentBalance0}
                        isTwap={false}
                        token={token0}
                        numDecimals={getNumerOfDecimals(flowRate0)}
                        isLoading={isLoading}
                    />
                )}
                {twapFlowRate1.gt(0) && (
                    <BalanceField
                        currentBalance={currentTwapBalance1}
                        isTwap
                        token={token1}
                        numDecimals={
                            19 -
                            twapFlowRate1.add(1000).toString().length -
                            (parseInt(twapFlowRate1.toString()[0]) > 5 ? 1 : 0)
                        }
                        isLoading={isLoading}
                    />
                )}
            </div>
            <div className="flex items-center justify-center md:pb-0 pb-6">
                <button 
                    className="flex space-x-2 items-center justify-center text-white bg-white/10 px-6 py-2 rounded-xl opacity-80 hover:opacity-100 hover:scale-[1.01] transition-all duration-300"
                    onClick={() => {
                        if (!poolAddress) { return; }

                        router.push(`/position/${poolAddress}/${token1.address}/${RetrieveFundsState.COLLECT_FUNDS}`);
                    }}
                >
                    <p>
                        {`Collect swapped ${token1.symbol}`}
                    </p>
                    <Image
                        src={token1.logoURI}
                        className="drop-shadow-md"
                        width="16"
                        height="16"
                        alt={token1.name}
                    />
                </button>
            </div>
            <div className="w-full flex sm:flex-nowrap flex-wrap 2grid 2grid-cols-2 2gap-2 sm:space-x-2 space-x-0 space-y-2 sm:space-y-0"
            >
                <DetailsDisplay
                    startDate={startDate}
                    endDate={endDate}
                    flowrate0={flowRate0}
                    token1={token1}
                    token0={token0}
                />
                <AveragePrice
                    token0={token0}
                    token1={token1}
                    price={price}
                />
            </div>
        </div>
    );
};

export default TotalAmountsStreamedWidget;