import { create } from "zustand";
import { TokenTypes } from "./types/TokenOption";

interface StoreState {
    outboundToken: TokenTypes | undefined;
    inboundToken: TokenTypes | undefined;
    setOutboundToken: (token: TokenTypes) => void;
    setInboundToken: (token: TokenTypes) => void;
}

// eslint-disable-next-line import/prefer-default-export
export const useStore = create<StoreState>()((set) => ({
    outboundToken: undefined,
    inboundToken: undefined,
    setOutboundToken: (outboundToken: TokenTypes) =>
        set((state) => ({ ...state, outboundToken })),
    setInboundToken: (inboundToken: TokenTypes) =>
        set((state) => ({ ...state, inboundToken })),
})); 