import { BigNumber } from "ethers";
import { TokenTypes } from "../types/TokenOption"
import { formatUnits } from 'viem'

interface props {
    token: TokenTypes | undefined;
    amount: BigNumber;
}

const formatTokenAmount = ({
    token,
    amount
}: props) => {
    if (!token) return '0';
    return formatUnits(amount.toBigInt(), token.decimals);
}

export default formatTokenAmount;