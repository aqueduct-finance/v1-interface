import getPoolContract from "./getPoolContract";

const usePool = (poolAddress: string | undefined) => {
    return getPoolContract(poolAddress)
}

export default usePool;