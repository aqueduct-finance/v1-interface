import React from "react";
import { ConnectKitButton } from "connectkit";

function ConnectWalletButton() {
    return (
        <ConnectKitButton.Custom>
            {({ show }) => (
                <button
                    type="button"
                    onClick={show}
                    className="font-semibold w-full h-full bg-transparent text-white text-xl px-4 py-2 whitespace-nowrap"
                >
                    Connect Wallet
                </button>
            )}
        </ConnectKitButton.Custom>
    );
}

export default ConnectWalletButton;
