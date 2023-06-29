import React from 'react'
import { ConnectKitButton } from "connectkit";


const ConnectWalletButton = () => {

    return (
        <ConnectKitButton.Custom>
            {({ show }) => {
                return (
                    <button onClick={show} className="font-semibold w-full h-full bg-transparent text-white text-xl px-4 py-2 whitespace-nowrap">
                        Connect Wallet
                    </button>
                );
            }}
        </ConnectKitButton.Custom>
    )
}

export default ConnectWalletButton;