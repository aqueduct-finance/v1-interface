import { BigNumber } from "ethers";

export interface realTimeBalanceRes {
    availableBalance: BigNumber;
    deposit: BigNumber;
    owedDeposit: BigNumber;
}

export const decodeRealTimeBalanceRes = (returnArray: unknown): realTimeBalanceRes => {
    const array = returnArray as any[];
    return {
        availableBalance: BigNumber.from(array[0] as BigInt),
        deposit: BigNumber.from(array[1] as BigInt),
        owedDeposit: BigNumber.from(array[2] as BigInt)
    }
}