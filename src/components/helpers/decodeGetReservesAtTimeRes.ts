import { ethers } from "ethers";

export interface getReservesAtTimeRes {
    reserve0: number;
    reserve1: number;
}

export const decodeGetReservesAtTimeRes = (returnArray: unknown): getReservesAtTimeRes => {
    const array = returnArray as any[];

    if (!array || array.length < 2) {
        return {
            reserve0: 0,
            reserve1: 0
        }
    }

    return {
        reserve0: parseFloat(ethers.utils.formatEther(array[0])),
        reserve1: parseFloat(ethers.utils.formatEther(array[1]))
    }
}