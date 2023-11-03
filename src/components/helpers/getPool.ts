import Address from "../../types/Address";
import {
    fDAIxfUSDCxPool,
} from "../../utils/constants"

const getPoolAddress = (outboundToken: string, inboundToken: string) => {
    switch (true) {
        case inboundToken === Address.fDAIx && outboundToken === Address.fUSDCx:
            return fDAIxfUSDCxPool;
        case inboundToken === Address.fUSDCx && outboundToken === Address.fDAIx:
            return fDAIxfUSDCxPool;
        default:
            return undefined;
            /*throw new Error(
                `Pool not found for tokens "${outboundToken}" and "${inboundToken}"`
            );*/
    }
};

export default getPoolAddress;