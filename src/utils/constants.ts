import getChainId from "../components/helpers/getChainId";

export const goerliChainId = 5;

export const mumbaiChainId = 80001;

interface Addresses {
    fDAI: string;
    fUSDC: string;
    fDAIx: string;
    fUSDCx: string;
    cfaV1: string;
    aqueductFactory: string;
}

interface Constants {
    [key: string]: Addresses;
}

export const constants: Constants = {
    5: { // goerli
        fDAI: "",
        fUSDC: "",
        fDAIx: "",
        fUSDCx: "",
        cfaV1: "",
        aqueductFactory: ""
    },
    80001: { // mumbai
        fDAI: "0x15F0Ca26781C3852f8166eD2ebce5D18265cceb7",
        fUSDC: "0xbe49ac1EadAc65dccf204D4Df81d650B50122aB2",
        fDAIx: "0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f",
        fUSDCx: "0x42bb40bF79730451B11f6De1CbA222F17b87Afd7",
        cfaV1: "0x49e565Ed1bdc17F3d220f72DF0857C26FA83F873",
        aqueductFactory: "0x6FF6508E881D677D5e40e7C1619008F9ff46A5F8"
    }
};

export function getAddresses(chainId: number): Addresses {
    return constants[chainId];
}

export function getDefaultAddresses(): Addresses | undefined {
    const chainId = getChainId();
    if (!chainId) { return; }

    return getAddresses(chainId);
}
