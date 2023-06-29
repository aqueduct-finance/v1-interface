export type TokenTypes = {
    name: string;
    address: string;
    symbol: string;
    decimals: number;
    chainId: number;
    underlyingToken?: TokenTypes;
    logoURI: string;
}