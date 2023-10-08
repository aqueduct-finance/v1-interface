import Image from "next/image";
import { TokenTypes } from "../../types/TokenOption";

function TokenName({
    token,
}: {
    token: TokenTypes;
}) {
    return (
        <div
            className="flex items-center h-6 relative"
            aria-label="Token label"
        >
            <div className="rounded drop-shadow-lg">
                <Image
                    src={token.logoURI}
                    className="z-10 "
                    width="28"
                    height="28"
                    alt={token.name}
                />
            </div>

            <div className="flex text-sm pl-3 space-x-2 font-medium items-end ">
                <p>
                    {token.name}
                </p>
                <p className="opacity-50 text-xs">
                    {token.symbol}
                </p>
            </div>
        </div>
    );
}

export default TokenName;
