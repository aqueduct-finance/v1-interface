
import React, { useEffect, useState } from 'react'
import { ConnectKitButton } from "connectkit";
import makeBlockie from 'ethereum-blockies-base64';
import Image from 'next/image';
import { useAccount } from 'wagmi';

const ConnectWalletButton = () => {
    const { address, isConnected, isDisconnected } = useAccount()
    const [text, setText] = useState("")
    const [connected, setConnected] = useState(false)

    const Avatar = ({ address }: { address?: string }) => {
        let blockie;

        if (typeof address === 'string') {
            blockie = makeBlockie(address);
        } else {
            blockie = '';
        }

        return <Image src={blockie} className="w-8 h-8 rounded-lg" width="40" height="40" alt="" />
    }

    useEffect(() => {
        if (isConnected && address) {
            setText(`${address.slice(0, 6)}...${address.slice(-4)}`)
            setConnected(true)
        } else {
            setText("Connect Wallet")
            setConnected(false)
        }
    }, [isConnected, isDisconnected, address])

    return (
        <ConnectKitButton.Custom>
            {({ show }) => {
                return (
                    <button
                        onClick={show}
                        className={`flex items-center justify-center space-x-4 font-medium text-aqueBg rounded-xl px-7 py-2 ${connected ? "bg-item text-white/80" : "bg-aqueductBlue text-white"}`}
                    >
                        {connected && (
                            <Avatar address={address} />
                        )}
                        <h1 className={`text-md font-semibold whitespace-nowrap`}>
                            {text}
                        </h1>
                    </button>
                );
            }}
        </ConnectKitButton.Custom>
    );
}

export default ConnectWalletButton;
