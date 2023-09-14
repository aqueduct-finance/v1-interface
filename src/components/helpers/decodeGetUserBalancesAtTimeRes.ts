import { BigNumber } from "ethers";

export interface getuserBalancesAtTimeRes {
    balance0: BigNumber;
    balance1: BigNumber;
}

export const decodeGetUserBalancesAtTimeRes = (returnArray: unknown): getuserBalancesAtTimeRes => {
    const array = returnArray as any[];
    return {
        balance0: BigNumber.from(array[0] as BigInt),
        balance1: BigNumber.from(array[1] as BigInt)
    }
}