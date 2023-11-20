import Link from "next/link";
import { RiCloseCircleFill, RiPencilFill } from "react-icons/ri";
import LoadingSpinner from "../LoadingSpinner";
import ButtonWithInfoPopup from "../ButtonInfoPopup";
import theme from "../../styles/theme";

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
    isLoading?: boolean;
    isDeleting?: boolean;
    setOutboundAndInboundTokens?: () => void;
    cancelStream?: () => void;
    padding?: string;
}

const WidgetContainer = ({
    title,
    smallTitle,
    buttons,
    children,
    isUnbounded,
    userAddress,
    address,
    isLoading,
    isDeleting,
    setOutboundAndInboundTokens,
    cancelStream,
    padding
}: WidgetContainerProps) => (
    <div
        className={
            `flex flex-col w-full ${padding} space-y-6 bg-transparent md:bg-current border-none md:border-solid transition md:shadow-2xl ${!isUnbounded && "  max-w-xl "
        }`}
        style={
            {
                borderColor: theme.borderColor,
                borderWidth: theme.primaryBorderWidth,
                borderRadius: theme.primaryBorderRadius,
                color: theme.bgColor
            }
        }
    >
        {(title || smallTitle || buttons) && (
            <div 
                className="flex space-x-4 whitespace-nowrap text-xl p-4"
            >
                {title && (
                    <div 
                        className="px-0 py-2 rounded-xl w-min"
                        style={{
                            fontWeight: theme.primaryFontWeight,
                            color: theme.primaryText
                        }}
                    >
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
                    <div className="pl-1 pr-4 flex items-center rounded-xl sm:text-lg text-sm font-semibold w-min text-white">
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
                                    href='/'
                                >
                                    {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions, jsx-a11y/anchor-is-valid */}
                                    <a
                                        onClick={() =>
                                            setOutboundAndInboundTokens()
                                        }
                                        className=" bg-aqueductBlue/10 flex items-center justify-center text-aqueductBlue/50 hover:text-aqueductBlue p-2 rounded-xl hover:bg-aqueductBlue/20 hover:text-black transition-all duration-300"
                                    >
                                        <RiPencilFill className="md:text-2xl sm:text-lg text-sm" />
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
                                    className="bg-red-500/10 text-red-600/50 p-2 rounded-xl hover:text-red-600 hover:bg-red-500/20 2hover:text-black transition-all duration-300"
                                    disabled={isLoading || isDeleting}
                                    aria-label="Delete stream button"
                                >
                                    {isDeleting ? (
                                        <div className="scale-90">
                                            <LoadingSpinner size={25} />
                                        </div>
                                    ) : (
                                        <RiCloseCircleFill className="md:text-2xl sm:text-lg text-sm" />
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