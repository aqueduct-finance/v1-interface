import { TokenTypes } from "./TokenOption";

interface LockedBalance {
    sentToken: TokenTypes;
    receivedToken: TokenTypes;
    amount: string;
    positionActive: boolean;
}

export default LockedBalance;