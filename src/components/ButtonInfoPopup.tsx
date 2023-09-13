interface ButtonWithInfoPopupParams {
    message: string;
    button: JSX.Element;
}

/*
 * absolute positioning was causing odd behavior inside scrollable div
 * workaround: float left and reposition everything
 */
const ButtonWithInfoPopup = ({
    message,
    button,
}: ButtonWithInfoPopupParams) => (
    <div className="group flex justify-center translate-x-1/2">
        <div className="w-0 h-0">
            <div className="float-left whitespace-nowrap -translate-x-1/2 -translate-y-9 text-xs bg-black/80 border-[1px] border-[#262626] px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 delay-300 text-white/75">
                {message}
            </div>
        </div>
        <div className="flex -translate-x-1/2">{button}</div>
    </div>
);

export default ButtonWithInfoPopup;