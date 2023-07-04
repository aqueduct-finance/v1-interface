import Address from "../../types/Address";
import {
    fDAIxfUSDCxPool,
} from "../../utils/constants"

const getPoolAddress = (outboundToken: string, inboundToken: string) => {
    let pool: string;

    switch (true) {
        case inboundToken === Address.fDAIx && outboundToken === Address.fUSDCx:
            pool = fDAIxfUSDCxPool;
            break;
        case inboundToken === Address.fUSDCx && outboundToken === Address.fDAIx:
            pool = fDAIxfUSDCxPool;
            break;
        default:
            throw new Error(
                `Pool not found for tokens "${outboundToken}" and "${inboundToken}"`
            );
    }

    return pool;
};

export default getPoolAddress;