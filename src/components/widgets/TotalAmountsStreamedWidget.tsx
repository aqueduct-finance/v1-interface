/* eslint-disable radix */
import { BigNumber } from "ethers";
import { TokenTypes } from "../../types/TokenOption";
import BalanceField from "../BalanceField";
import DetailsDisplay from "../streamview/DetailsDisplay";
import AveragePrice from "../streamview/AveragePrice";

interface TotalAmountsStreamedWidgetProps {
    flowRate0: BigNumber;
    flowRate1: BigNumber;
    twapFlowRate0: BigNumber;
    twapFlowRate1: BigNumber;
    currentBalance0: BigNumber;
    currentBalance1: BigNumber;
    token0: TokenTypes;
    token1: TokenTypes;
    currentTwapBalance0: BigNumber;
    currentTwapBalance1: BigNumber;
    isLoading: boolean;
    startDate: Date | undefined;
    endDate: Date | undefined;
    price: number;
}

const TotalAmountsStreamedWidget = ({
    flowRate0,
    flowRate1,
    twapFlowRate0,
    twapFlowRate1,
    currentBalance0,
    currentBalance1,
    token0,
    token1,
    currentTwapBalance0,
    currentTwapBalance1,
    isLoading,
    startDate,
    endDate,
    price
}: TotalAmountsStreamedWidgetProps) => {
    const getNumerOfDecimals = (flowRate: BigNumber) => {
        const flowRateDigitCount = flowRate.toString().length;
        const firstDigit = parseInt(flowRate.toString()[0]);
        const oneOrZero = firstDigit > 5 ? 1 : 0;

        return 19 - flowRateDigitCount - oneOrZero;
    };

    return (
        <div className="md:space-y-6 lg:space-y-10">
            <div className="space-y-4">
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
            <div className="w-full flex 2grid 2grid-cols-2 2gap-2 space-x-2"
            >
                <DetailsDisplay
                    startDate={startDate}
                    endDate={endDate}
                    flowrate0={flowRate0}
                    txHash="0x"
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