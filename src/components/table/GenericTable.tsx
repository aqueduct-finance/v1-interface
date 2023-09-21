/* eslint-disable react/require-default-props, react/jsx-no-useless-fragment */
import { ExplicitAny } from "../../types/ExplicitAny";
import WidgetContainer from "../widgets/WidgetContainer";
import TableRow from "./TableRow";
import theme from "../../styles/theme";

interface GenericTableProps {
    title: string;
    labels: string[];
    columnProps: string[];
    columnComponents: ((...args: ExplicitAny) => JSX.Element)[];
    rowLinks: string[] | undefined;
    data: ExplicitAny[][] | undefined;
    isLoading: boolean;
    noDataMessage?: string;
}

const GenericTable = ({
    title,
    labels,
    columnProps,
    columnComponents,
    rowLinks,
    data,
    isLoading,
    noDataMessage,
}: GenericTableProps) => (
    <WidgetContainer padding="md:p-5 md:pb-8" title={title} isUnbounded>
        <div className="flex px-4 text-white font-semibold">
            {labels.map((label, i) => (
                <div 
                    className={columnProps[i]} 
                    key={label}
                    style={{
                        fontWeight: theme.secondaryFontWeight,
                        color: theme.accentText
                    }}
                >
                    {label}
                </div>
            ))}
        </div>
        <div className="px-2 pt-2 space-y-2">
            {
                [
                    {letter:'A', name:'ACME corp', price:'1,628', limit:'128.5', spaceA: '9.6rem', spaceB: '8.1rem'},
                    {letter:'B', name:'Bank A', price:'1,685', limit:'10.28', spaceA: '11.5rem', spaceB: '8.1rem'},
                    {letter:'F', name:'FinanceCorp B', price:'1,720', limit:'10,756.2', spaceA: '8.1rem', spaceB: '8.1rem'}
                ].map((obj) => {
                    return (
                        <div className="flex w-full h-32 bg-white/5 rounded-2xl">
                            <div className="flex p-4 space-x-3 h-min items-center flex-shrink-0">
                                <div className="flex items-center justify-center bg-aqueductBlue/50 rounded-full w-10 h-10 text-white/80">
                                    {obj.letter}
                                </div>
                                <p className="text-white">
                                    {obj.name}
                                </p>
                            </div>
                            <div 
                                className={`flex p-4 space-x-2 h-min items-center`}
                                style={{paddingLeft: obj.spaceA}}
                            >
                                <div className="flex items-center justify-center bg-aqueductBlue/50 rounded-full w-0 h-10 text-white/80 opacity-0">
                                    {obj.letter}
                                </div>
                                <p className="text-white text-2xl font-bold">
                                    {obj.price}
                                </p>
                                <p className="text-white pt-[0.4rem]">
                                    DAI
                                </p>
                                <img
                                className="w-5 h-5"
                                    src='/dai-logo.png'
                                />
                            </div>
                            <div 
                                className={`flex p-4 space-x-2 h-min items-center`}
                                style={{paddingLeft: obj.spaceB}}
                            >
                                <div className="flex items-center justify-center bg-aqueductBlue/50 rounded-full w-0 h-10 text-white/80 opacity-0">
                                    {obj.letter}
                                </div>
                                <p className="text-white text-2xl font-bold">
                                    {obj.limit}
                                </p>
                                <p className="text-white pt-[0.4rem]">
                                    ETH
                                </p>
                                <img
                                className="w-5 h-5"
                                    src='/eth-logo.png'
                                />
                            </div>
                            <div 
                                className="w-full"
                            />
                            <div className="flex-shrink-0 bg-aqueductBlue/75 rounded-lg w-32 h-12 flex items-center justify-center text-white mr-3 mt-3">
                                Trade
                            </div>
                        </div>
                    )
                })
            }
        </div>
        {/*<div className="flex px-4 text-white font-semibold">
            {labels.map((label, i) => (
                <div 
                    className={columnProps[i]} 
                    key={label}
                    style={{
                        fontWeight: theme.secondaryFontWeight,
                        color: theme.accentText
                    }}
                >
                    {label}
                </div>
            ))}
        </div>
        {isLoading && (
            <div className="flex flex-col space-y-2">
                {[0, 1, 2].map((i) => (
                    <div
                        className={`w-full p-4 text-transparent animate-pulse`}
                        key={`loading-${i}`}
                        style={{
                            background: theme.tokenBox,
                            borderRadius: theme.secondaryBorderRadius
                        }}
                    >
                        -
                    </div>
                ))}
            </div>
        )}

        {data && data.length > 0 ? (
            <div className="flex flex-col space-y-2">
                {data.map((d, i) => (
                    <TableRow
                        columnProps={columnProps}
                        columnComponents={columnComponents}
                        link={rowLinks ? rowLinks[i] : ""}
                        data={d}
                        // TODO: don't use index as key
                        // eslint-disable-next-line react/no-array-index-key
                        key={`column-${i}`}
                    />
                ))}
            </div>
        ) : (
            <>{!isLoading &&
                <div className="pt-4">
                    <p className="p-4 text-white/50 w-full bg-item flex items-center justify-center rounded-2xl">{noDataMessage}</p>
                </div>
            }</>
        )}*/}
    </WidgetContainer>
);

export default GenericTable;