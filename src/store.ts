import { create } from "zustand";
import { TokenTypes } from "./types/TokenOption";
import { Chain, chains } from "./utils/chains";

interface StoreState {
    chain: Chain;
    outboundToken: TokenTypes | undefined;
    inboundToken: TokenTypes | undefined;
    setChain: (chain: Chain) => void;
    setOutboundToken: (token: TokenTypes) => void;
    setInboundToken: (token: TokenTypes) => void;
}

// eslint-disable-next-line import/prefer-default-export
export const useStore = create<StoreState>()((set) => ({
    chain: chains.mumbai,
    outboundToken: undefined,
    inboundToken: undefined,
    setChain: (chain: Chain) =>
        set((state) => ({ ...state, chain })),
    setOutboundToken: (outboundToken: TokenTypes) =>
        set((state) => ({ ...state, outboundToken })),
    setInboundToken: (inboundToken: TokenTypes) =>
        set((state) => ({ ...state, inboundToken })),
})); 