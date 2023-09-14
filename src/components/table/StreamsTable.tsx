import { useEffect, useState } from "react";
import { Framework } from "@superfluid-finance/sdk-core";
import { useAccount, useNetwork } from "wagmi";
import { useEthersProvider } from "../providers/provider";
import BalancesField from "./BalancesField";
import GenericTable from "./GenericTable";
import { fDAIxfUSDCxPool, fDAIx, fUSDCx } from "../../utils/constants";
import getToken from "../../utils/getToken";
import TextField from "./TextField";
import PoolField from "./PoolField";
import { ExplicitAny } from "../../types/ExplicitAny";
import useCFA from "../helpers/useCFA";
import { decodeGetFlowRes } from "../helpers/decodeGetFlowRes";

function StreamsTable() {
    const provider = useEthersProvider();
    const { chain } = useNetwork();
    const { address } = useAccount();
    const cfa = useCFA();

    const [data, setData] = useState<ExplicitAny[][]>();
    const [links, setLinks] = useState<string[]>();

    const [isLoading, setIsLoading] = useState(true);

    // get streams from pool contract
    // TODO: router/factory contract to track current streams so we don't have to manually check here
    useEffect(() => {
        async function updateData() {
            if (!address || !chain || !provider) {
                return;
            }

            const chainId = chain?.id;

            const pools = [
                { token0: fUSDCx, token1: fDAIx, address: fDAIxfUSDCxPool },
            ];

            const newData: ExplicitAny[][] = [];
            const newLinks: ExplicitAny[] = [];
            await Promise.all(
                pools.map(async (p) => {

                    // get tokens info
                    const token0 = await getToken({
                        tokenAddress: `${p.token0}`,
                        provider,
                        chainId,
                    });
                    const token1 = await getToken({
                        tokenAddress: `${p.token1}`,
                        provider,
                        chainId,
                    });

                    if (!token0 || !token1) { return }

                    // batch call: get flows for both
                    const [flowParams0, flowParams1] = await Promise.all([
                        cfa.read.getFlow([p.token0, address, p.address]),
                        cfa.read.getFlow([p.token1, address, p.address]),
                    ])

                    const decodedFlowParams0 = decodeGetFlowRes(flowParams0);
                    const decodedFlowParams1 = decodeGetFlowRes(flowParams1);

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
                    } else if (decodedFlowParams1.flowRate !== "0") {
                        const date = new Date(Number(decodedFlowParams1.timestamp) * 1000);
                        newData.push([
                            { token0, token1 },
                            { title: date.toLocaleDateString() },
                            { token0, token1 },
                        ]);
                        newLinks.push(
                            `pair/mumbai/${address}/${token0.address}/${token1.address}`
                        );
                    }
                })
            );

            console.log(newData)

            setData(newData);
            setLinks(newLinks);
            setIsLoading(false);
        }

        updateData();
    }, [address, chain, provider]);

    return (
        <section className="flex flex-col items-center w-full pb-64">
            <div className="w-full max-w-6xl px-4">
                <GenericTable
                    title="My Swaps"
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
            </div>
        </section>
    );
}

export default StreamsTable;
