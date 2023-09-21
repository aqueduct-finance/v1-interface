/* eslint-disable react/require-default-props, react/jsx-no-useless-fragment */
import { ExplicitAny } from "../../types/ExplicitAny";
import WidgetContainer from "../widgets/WidgetContainer";
import TableRow from "./TableRow";
import theme from "../../styles/theme";
import {BsCheck} from 'react-icons/bs'

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
        <div className="px-2 space-y-2">
            <div className="flex text-white pl-4 space-x-4 py-3 mb-6 rounded-xl bg-white/5 w-full">
                <div className="rounded-md w-6 h-6 border-2 border-white/20 bg-white/5">

                </div>
                <p>
                    Invite all users in Aqueduct network
                </p>
            </div>
            {
                [
                    "ACME corp",
                    "Bank A",
                    "FinanceCorp B",
                    "Institution C",
                    "DefiGroup D",
                    "Network E Financial",
                    "Bank F",
                    "DefiHub G",
                    "Financial Network H",
                    "Bank I"
                  ].map((str, i) => {
                    return (
                        <div className="flex text-white pl-4 space-x-4 py-3 rounded-xl bg-white/5 w-full">
                            <div className={`flex items-center justify-center rounded-md w-6 h-6 border-2 border-white/20 ${i == 0 || i == 2 ? ' bg-aqueductBlue ' : ' bg-white/5 '}`}>
                                {
                                    (i == 0 || i == 2) &&
                                    <BsCheck />
                                }
                            </div>
                            <p>
                                {str}
                            </p>
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