import { ethers } from "ethers";

export interface getReservesRes {
    reserve0: number;
    reserve1: number;
    time: number;
}

export const decodeGetReservesRes = (returnArray: unknown): getReservesRes => {
    const array = returnArray as any[];

    if (!array || array.length < 3) {
        return {
            reserve0: 0,
            reserve1: 0,
            time: 0
        }
    }

    return {
        reserve0: parseFloat(ethers.utils.formatEther(array[0])),
        reserve1: parseFloat(ethers.utils.formatEther(array[1])),
        time: parseFloat(array[2])
    }
}