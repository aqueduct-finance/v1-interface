export interface getFlowRes {
    timestamp: string;
    flowRate: string;
    deposit: string;
    owedDeposit: string;
}

export const decodeGetFlowRes = (returnArray: unknown): getFlowRes => {
    const array = returnArray as any[];
    return {
        timestamp: (array[0] as unknown as BigInt).toString(),
        flowRate: (array[1] as unknown as BigInt).toString(),
        deposit: (array[2] as unknown as BigInt).toString(),
        owedDeposit: (array[3] as unknown as BigInt).toString()
    }
}