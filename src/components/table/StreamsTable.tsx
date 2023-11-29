import { useEffect, useState } from "react";
import { Framework } from "@superfluid-finance/sdk-core";
import { useAccount, useNetwork } from "wagmi";
import { useEthersProvider } from "../providers/provider";
import BalancesField from "./BalancesField";
import GenericTable from "./GenericTable";
import getToken from "../../utils/getToken";
import TextField from "./TextField";
import PoolField from "./PoolField";
import { ExplicitAny } from "../../types/ExplicitAny";
import useCFA from "../helpers/useCFA";
import { decodeGetFlowRes } from "../helpers/decodeGetFlowRes";
import WidgetContainer from "../widgets/WidgetContainer";
import getPoolContract from "../helpers/getPoolContract";
import { decodeGetUserBalancesAtTimeRes } from "../helpers/decodeGetUserBalancesAtTimeRes";
import formatTokenAmount from "../../utils/parseTokenAmount";
import LockedBalance from "../../types/LockedBalance";
import LockedBalancesList from "./LockedBalancesList";
import { getDefaultAddresses } from "../../utils/constants";
import { getDefaultWhitelistedPools } from "../../utils/whitelistedPools";
import { useStore } from "../../store";

function StreamsTable() {
    const provider = useEthersProvider();
    const { chain } = useNetwork();
    const { address } = useAccount();
    const cfa = useCFA();

    const [data, setData] = useState<ExplicitAny[][]>();
    const [links, setLinks] = useState<string[]>();

    const store = useStore();

    const [isLoading, setIsLoading] = useState(true);

    const [lockedBalances, setLockedBalances] = useState<LockedBalance[]>([]);

    // get streams from pool contract
    // TODO: subgraph to track current streams so we don't have to manually check here
    useEffect(() => {
        async function updateData() {
            setIsLoading(true);
            setData(undefined);
            setLinks(undefined);
            setLockedBalances([]);

            if (!address || !chain || !provider || !cfa) {
                return;
            }

            const chainId = chain.id;
            const addresses = getDefaultAddresses();
            const pools = getDefaultWhitelistedPools();
            if (!addresses || !pools) { return; }

            const newData: ExplicitAny[][] = [];
            const newLinks: ExplicitAny[] = [];
            const newBalances: LockedBalance[] = [];
            await Promise.all(
                pools.map(async (p) => {

                    // get tokens info
                    let token0 = await getToken({
                        tokenAddress: `${p.token0}`,
                        provider,
                        chainId,
                    });
                    let token1 = await getToken({
                        tokenAddress: `${p.token1}`,
                        provider,
                        chainId,
                    });

                    // get pool contract
                    const poolContract = getPoolContract(p.address);

                    if (!token0 || !token1 || !poolContract) { return }

                    // batch call: get flows for both and user balances
                    const [flowParams0, flowParams1, userBalances] = await Promise.all([
                        cfa.read.getFlow([p.token0, address, p.address]),
                        cfa.read.getFlow([p.token1, address, p.address]),
                        poolContract.read.getRealTimeUserBalances([address])
                    ]);

                    const decodedFlowParams0 = decodeGetFlowRes(flowParams0);
                    const decodedFlowParams1 = decodeGetFlowRes(flowParams1);
                    const decodedUserBalances = decodeGetUserBalancesAtTimeRes(userBalances);

                    // handle streams
                    if (decodedFlowParams0.flowRate !== "0") {
                        const date = new Date(Number(decodedFlowParams0.timestamp) * 1000);
                        newData.push([
                            { token0, token1 },
                            { title: date.toLocaleDateString() },
                            { token0, token1 },
                        ]);
                        newLinks.push(
                            `pair/mumbai/${address}/${token0.address}/${token1.address}`
                        );
                    }
                    if (decodedFlowParams1.flowRate !== "0") {
                        const date = new Date(Number(decodedFlowParams1.timestamp) * 1000);
                        newData.push([
                            { token0: token1, token1: token0 },
                            { text: date.toLocaleDateString() },
                            { token0: token1, token1: token0 },
                        ]);
                        newLinks.push(
                            `pair/mumbai/${address}/${token1.address}/${token0.address}`
                        );
                    }

                    // handle locked funds
                    if (decodedUserBalances.balance0.gt(0)) {
                        newBalances.push({
                            sentToken: token1,
                            receivedToken: token0,
                            amount: formatTokenAmount({token: token0, amount: decodedUserBalances.balance0}),
                            positionActive: decodedFlowParams1.flowRate !== "0"
                        });
                    }
                    if (decodedUserBalances.balance1.gt(0)) {
                        newBalances.push({
                            sentToken: token0,
                            receivedToken: token1,
                            amount: formatTokenAmount({token: token1, amount: decodedUserBalances.balance1}),
                            positionActive: decodedFlowParams0.flowRate !== "0"
                        });
                    }
                })
            );

            setData(newData);
            setLinks(newLinks);
            setLockedBalances(newBalances);
            setIsLoading(false);
        }

        updateData();
    }, [address, provider, store.chain]);

    return (
        <section className="flex flex-col items-center w-full pb-64">
            <div className="w-full max-w-6xl px-4">
                <WidgetContainer padding="md:p-5 md:pb-8" title='My Swaps' isUnbounded>
                    <GenericTable
                        labels={["Pool", "Start Date", "Balances"]}
                        columnProps={[
                            "min-w-[14rem] w-full max-w-[20rem]",
                            "min-w-[7rem] w-full max-w-[16rem]",
                            "min-w-[14rem] w-full max-w-[25rem] hidden lg:flex",
                        ]}
                        columnComponents={[PoolField, TextField, BalancesField]}
                        rowLinks={links}
                        data={data}
                        isLoading={isLoading}
                        noDataMessage={"You currently don't have any streams"}
                    />
                    <LockedBalancesList 
                        lockedBalances={lockedBalances} 
                    />
                </WidgetContainer>
            </div>
        </section>
    );
}

export default StreamsTable;
