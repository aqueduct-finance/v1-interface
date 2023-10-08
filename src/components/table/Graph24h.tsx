import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

interface Sync {
    blockTimestamp: number;
    reserve0: number;
    reserve1: number;
    [key: string]: number;
}

function Graph24h({ syncs, dataKey }: { syncs: Sync[], dataKey: string }) {

    const type = "monotone";

    return (
        <div className="monospace-font text-sm font-semibold ">
            <ResponsiveContainer
                width="90%"
                height={25}
            >
                {
                    syncs.length > 0 ?
                    <LineChart
                        width={800}
                        height={400}
                        data={syncs}
                        margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                    >
                        <YAxis scale="log" domain={['auto', 'auto']} hide />
                        <Line 
                            type={type} 
                            dataKey={dataKey}
                            //stroke={`${swapStartDisplay === Infinity ? "#5783F3" : "url(#graph)"}`} 
                            stroke={syncs[syncs.length - 1][dataKey] >= syncs[0][dataKey] ? '#22c55eB0' : '#ef4444B0'}
                            dot={false} 
                            strokeWidth="2px"
                        />
                    </LineChart> :
                    <></>
                }
            </ResponsiveContainer>
        </div>
    );
}

export default Graph24h;
