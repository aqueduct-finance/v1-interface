import { BigNumber } from "ethers";

export interface getReservesAtTimeRes {
    reserve0: BigNumber;
    reserve1: BigNumber;
}

export const decodeGetReservesAtTimeRes = (returnArray: unknown): getReservesAtTimeRes => {
    const array = returnArray as any[];
    return {
        reserve0: BigNumber.from(array[0] as BigInt),
        reserve1: BigNumber.from(array[1] as BigInt)
    }
}