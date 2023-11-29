import { getNetwork } from '@wagmi/core'
import { useStore } from '../../store';

const getChainId = (): number | undefined => {
    
    const { chain } = getNetwork();
    if (chain) { return chain.id; }

    // chain should be the same as store.chain, but if chain is undefined, default to store state
    return useStore.getState().chain.chainId;
}

export default getChainId;