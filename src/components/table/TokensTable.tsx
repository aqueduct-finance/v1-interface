import { useEffect, useState } from "react";
import { Framework } from "@superfluid-finance/sdk-core";
import { useAccount, useNetwork } from "wagmi";
import { useEthersProvider } from "../providers/provider";
import BalancesField from "./BalancesField";
import GenericTable from "./GenericTable";
import { fDAIxfUSDCxPool } from "../../utils/constants";
import getToken from "../../utils/getToken";
import TextField from "./TextField";
import TokenName from "./TokenName";
import { ExplicitAny } from "../../types/ExplicitAny";
import useCFA from "../helpers/useCFA";
import { decodeGetFlowRes } from "../helpers/decodeGetFlowRes";
import getPoolContract from "../helpers/getPoolContract";
import { decodeGetReservesRes } from "../helpers/decodeGetReservesRes";
import { gql, useQuery } from "@apollo/client";
import PercentChangeField from "./PercentChangeField";
import Graph24h from "./Graph24h";
import { ethers } from "ethers";
import { fDAIx, fUSDCx } from "../../utils/tokens";
import { TokenTypes } from "../../types/TokenOption";

function TokensTable() {
    const provider = useEthersProvider();
    const { chain } = useNetwork();
    const { address } = useAccount();
    const cfa = useCFA();

    const [tableData, setTableData] = useState<ExplicitAny[][]>();
    const [links, setLinks] = useState<string[]>();

    const [isLoading, setIsLoading] = useState(true);

    const GET_DATA = gql`
        {
            syncs(first: 500, orderBy: blockTimestamp, orderDirection: asc) {
            id
            reserve0
            reserve1
            blockTimestamp
            }
        }
    `;

    const { error, data } = useQuery(GET_DATA);

    // binary search to find closest timestamp to 24h ago (for % change calc)
    function findClosestTimestamp(arr: Sync[], targetTimestamp: number) {
        const l = Math.floor(arr.length / 4);
        return findClosestTimestampRecur(arr, targetTimestamp, arr.length - 1 - l, l);
    }

    function findClosestTimestampRecur(arr: Sync[], targetTimestamp: number, i: number, l: number) {
        if (targetTimestamp == arr[i].blockTimestamp || l == 0) {
            return { sync: arr[i], index: i };
        } else if (targetTimestamp > arr[i].blockTimestamp) {
            const newL = Math.floor(l/2);
            return findClosestTimestampRecur(arr, targetTimestamp, i + newL, newL);
        } else {
            const newL = Math.floor(l/2);
            return findClosestTimestampRecur(arr, targetTimestamp, i - newL, newL);
        }
    }

    useEffect(() => {
        async function updateData() {
            if (!data) {
                return;
            }

            const tokens: {token: TokenTypes, poolAddress: string}[] = [
                { token: fUSDCx, poolAddress: fDAIxfUSDCxPool },
                { token: fDAIx, poolAddress: fDAIxfUSDCxPool }
            ];

            const newData: ExplicitAny[][] = [];
            const newLinks: ExplicitAny[] = [];
            await Promise.all(
                tokens.map(async (t) => {
                    const poolContract = getPoolContract(t.poolAddress);

                    if (!poolContract) { return }

                    // batch call
                    const readOps = [
                        poolContract.read.getReserves([]), // get reserves
                        poolContract.read.token0([]), // get each token
                        poolContract.read.token1([])
                    ];
                    if (address) { readOps.push(cfa.read.getFlow([t.token.address, address, t.poolAddress]))} // if connected wallet, get flowrate
                    const [reserves, token0, token1, flowParams] = await Promise.all(readOps); 

                    // decode params
                    const decodedReserves = decodeGetReservesRes(reserves);
                    const decodedFlowParams = flowParams && decodeGetFlowRes(flowParams); // TODO: use to show if position is active?
 
                    // TODO: need to query subgraph data from each pool
                    // find sync from ~24h ago
                    const targetTimestamp24h = decodedReserves.time - (3600 * 24);
                    const data24h = findClosestTimestamp(data.syncs, targetTimestamp24h);
                    const sync24h = data24h.sync;

                    // calc price, 24h change, and TVL
                    var price: number|undefined = undefined;
                    var change: number|undefined = undefined;
                    var tvl: number|undefined = undefined;
                    var dataKey: string|undefined = undefined;
                    if (t.token.address == token0 && token1 == fUSDCx.address) {
                        price = decodedReserves.reserve1 / decodedReserves.reserve0;
                        tvl = decodedReserves.reserve1; // intentional: tvl = amnt * price
                        dataKey = 'reserve1';

                        const price24h = sync24h.reserve1 / sync24h.reserve0;
                        change = (price - price24h) / price24h * 100;
                    } else if (t.token.address == token1 && token0 == fUSDCx.address) {
                        price = decodedReserves.reserve0 / decodedReserves.reserve1;
                        tvl = decodedReserves.reserve0;
                        dataKey = 'reserve0';

                        const price24h = sync24h.reserve0 / sync24h.reserve1;
                        change = (price - price24h) / price24h * 100;
                    } else if (t.token.address == fUSDCx.address) {
                        // special case (temporary):
                        price = 1;
                        tvl = t.token.address == token0 ? decodedReserves.reserve0 : decodedReserves.reserve1;
                        change = 0;
                        dataKey = t.token.address == token0 ? 'reserve1' : 'reserve0'; // opposite reserve will show price correctly
                    } else {
                        // TODO: get external price
                    }

                    // slice syncs for 24h display and add most recent datapoint
                    const syncs24h = data.syncs.slice(data24h.index);
                    const formattedSyncs24h = [];
                    syncs24h.forEach((s: SyncQuery) => {
                        formattedSyncs24h.push({
                            blockTimestamp: parseFloat(s.blockTimestamp),
                            reserve0: parseFloat(ethers.utils.formatEther(s.reserve0)),
                            reserve1: parseFloat(ethers.utils.formatEther(s.reserve1))
                        })
                    });
                    formattedSyncs24h.push({
                        blockTimestamp: decodedReserves.time,
                        reserve0: decodedReserves.reserve0,
                        reserve1: decodedReserves.reserve1
                    });

                    newData.push([
                        { token: t.token },
                        { text: price != undefined ? price.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '---' }, // TODO: currency localization
                        { change: change },
                        { text: tvl ? tvl.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '---' },
                        { syncs: formattedSyncs24h, dataKey: dataKey }
                    ]);
                    newLinks.push(
                        //`pair/mumbai/${address}/${token0}/${token1}`
                        ''
                    );
                })
            );

            setTableData(newData);
            setLinks(newLinks);
            setIsLoading(false);
        }

        updateData();
    }, [address, chain, provider, data]);

    return (
        <section className="flex flex-col items-center w-full pb-64">
            <div className="w-full max-w-6xl px-4">
                <GenericTable
                    title="Tokens"
                    labels={["Token Name", "Price", "Change", "TVL", ""]}
                    columnProps={[
                        "min-w-[16rem] max-w-[20rem]",
                        "min-w-[10rem] max-w-[20rem]",
                        "min-w-[10rem] max-w-[20rem]",
                        "min-w-[12rem] max-w-[20rem]",
                        "min-w-[12rem] w-full max-w-[20rem] pr-12"
                    ]}
                    columnComponents={[TokenName, TextField, PercentChangeField, TextField, Graph24h]}
                    rowLinks={links}
                    data={tableData}
                    isLoading={isLoading}
                    noDataMessage={"No available tokens"}
                    rowProps="py-6"
                />
            </div>
        </section>
    );
}

export default TokensTable;
