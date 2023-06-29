import Image from "next/image";
import { TokenTypes } from "../../types/TokenOption";

const PoolField = ({
    token0,
    token1,
}: {
    token0: TokenTypes;
    token1: TokenTypes;
}) => (
    <div
        className="flex items-center h-6 relative"
        aria-label="Table pool label"
    >
        <div className="-mr-2 rounded drop-shadow-lg">
            <Image src={token0.logoURI} className="z-10 " width="28" height="28" alt="Jeff" />
        </div>
        <div className="rounded drop-shadow-lg">
            <Image src={token1.logoURI} width="28" height="28" alt="Bob" />
        </div>

        <div className="flex text-sm pl-4 space-x-1 monospace-font font-semibold">
            <p>{token0.symbol}</p>
            <p>/</p>
            <p>{token1.symbol}</p>
        </div>
    </div>
);

export default PoolField;