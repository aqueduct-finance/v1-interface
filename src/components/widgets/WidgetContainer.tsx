import Link from "next/link";
import { RiCloseCircleFill, RiPencilFill } from "react-icons/ri";
import LoadingSpinner from "../LoadingSpinner";
import ButtonWithInfoPopup from "../ButtonInfoPopup";

/* eslint-disable react/require-default-props */
type ButtonProps = {
    title: string;
    action: () => void;
    isSelected: boolean;
};

interface WidgetContainerProps {
    title?: string;
    smallTitle?: string;
    buttons?: ButtonProps[];
    children: React.ReactNode;
    isUnbounded?: boolean;
    userAddress?: string | undefined
    address?: `0x${string}` | undefined
    isTwap0?: boolean;
    isTwap1?: boolean;
    isLoading?: boolean;
    isDeleting?: boolean;
    setOutboundAndInboundTokens?: () => void;
    cancelStream?: () => void;
}

const WidgetContainer = ({
    title,
    smallTitle,
    buttons,
    children,
    isUnbounded,
    userAddress,
    address,
    isTwap0,
    isTwap1,
    isLoading,
    isDeleting,
    setOutboundAndInboundTokens,
    cancelStream
}: WidgetContainerProps) => (
    <div
        className={`poppins-font flex flex-col w-full md:p-2 space-y-6 rounded-[2rem] md:bg-black dark:md:border-gray-800/60 dark:md:bg-gray-900/60 border-[2px] border-[#262626] transition ${!isUnbounded && "  max-w-xl "
            }`}
    >
        {(title || smallTitle || buttons) && (
            <div className="flex font-bold space-x-4 text-2xl whitespace-nowrap p-4">
                {title && (
                    <div className="px-2 py-2 rounded-xl  w-min text-white">
                        {title}
                    </div>
                )}
                {buttons &&
                    buttons.map((button) => (
                        <button
                            type="button"
                            onClick={button.action}
                            className={`px-4 py-2 rounded-xl w-min transition-all ${button.isSelected
                                ? "bg-aqueductBlue/10 text-aqueductBlue"
                                : "bg-gray-500/10 text-gray-500/60 opacity-50 hover:opacity-100"
                                }`}
                            key={button.title}
                        >
                            {button.title}
                        </button>
                    ))}
                {!title && !buttons && (
                    <div className="pl-1 pr-4 flex items-center rounded-xl text-lg font-semibold w-min text-white">
                        {smallTitle}
                    </div>
                )}
                <div className="flex w-full max-w-4xl space-x-2 items-center justify-center">
                    <div className="flex grow" />
                    {userAddress && address && userAddress === address && setOutboundAndInboundTokens && (
                        <ButtonWithInfoPopup
                            message="Edit Swap"
                            button={
                                <Link
                                    legacyBehavior
                                    href={
                                        isTwap0 && isTwap1
                                            ? "/provide-liquidity"
                                            : "/"
                                    }
                                >
                                    {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions, jsx-a11y/anchor-is-valid */}
                                    <a
                                        onClick={() =>
                                            setOutboundAndInboundTokens()
                                        }
                                        className=" bg-aqueductBlue/20 flex items-center justify-center text-aqueductBlue p-2 rounded-xl hover:bg-aqueductBlue/75 hover:text-black transition-all duration-300"
                                    >
                                        <RiPencilFill size={25} />
                                    </a>
                                </Link>
                            }
                        />
                    )}
                    {userAddress && address && userAddress === address && cancelStream && (
                        <ButtonWithInfoPopup
                            message="Cancel Swap"
                            button={
                                <button
                                    type="button"
                                    onClick={() => cancelStream()}
                                    className="bg-red-500/30 text-red-600 p-2 rounded-xl hover:bg-red-500/75 hover:text-black transition-all duration-300"
                                    disabled={isLoading || isDeleting}
                                    aria-label="Delete stream button"
                                >
                                    {isDeleting ? (
                                        <div className="scale-90">
                                            <LoadingSpinner size={25} />
                                        </div>
                                    ) : (
                                        <RiCloseCircleFill size={25} />
                                    )}
                                </button>
                            }
                        />
                    )}
                </div>
            </div>
        )}
        {children}
    </div>
);

export default WidgetContainer;