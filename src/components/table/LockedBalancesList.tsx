import Image from "next/image";
import LockedBalance from "../../types/LockedBalance";
import theme from "../../styles/theme";
import { useRouter } from "next/router";
import RetrieveFundsState from "../../types/RetrieveFundsState";
import getPoolAddress from "../helpers/getPool";

const LockedBalancesList = ({lockedBalances}: {lockedBalances: LockedBalance[]}) => {

    const router = useRouter();

    return (
        <div className="text-white space-y-3">
            {
                lockedBalances && lockedBalances.map(b => {
                    if (!b.positionActive) {
                        return (
                            <div
                                className={`relative flex p-2 pl-6 items-center justify-between border-2 border-transparent text-sm font-medium  transition-all duration-300`}
                                aria-label="Locked balance row"
                                style={{
                                    background: theme.tokenBox,
                                    borderRadius: theme.secondaryBorderRadius,
                                    color: theme.primaryText,
                                }}
                            >
                                <p className="opacity-75">
                                    {`You swapped ${b.sentToken.symbol} for ${b.amount} ${b.receivedToken.symbol}, which is currently stored in the pool.`}
                                </p>
                                <button 
                                    className="flex items-center justify-center space-x-3 px-4 py-3 bg-aqueductBlue/70 hover:bg-aqueductBlue/80 font-bold"
                                    style={{
                                        //background: theme.swapButton,
                                        borderRadius: `calc(${theme.secondaryBorderRadius} - 0.5rem)`,
                                    }}
                                    onClick={() => {
                                        router.push(`/position/${getPoolAddress(b.sentToken.address, b.receivedToken.address)}/${b.receivedToken.address}/${RetrieveFundsState.COLLECT_FUNDS}`);
                                    }}
                                >
                                    <p>
                                        {`Retrieve your ${b.receivedToken.symbol}`}
                                    </p>
                                    <Image
                                        src={b.receivedToken.logoURI}
                                        className="drop-shadow-md"
                                        width="16"
                                        height="16"
                                        alt={b.receivedToken.name}
                                    />
                                </button>
                            </div>
                        )
                    }
                })
            }
        </div>
    )
}

export default LockedBalancesList;