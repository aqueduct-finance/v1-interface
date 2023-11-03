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
    rowFunctions: (() => void)[];
    data: ExplicitAny[][] | undefined;
    isLoading: boolean;
    noDataMessage?: string;
    rowProps?: string;
}

const GenericTable = ({
    title,
    labels,
    columnProps,
    columnComponents,
    rowLinks,
    rowFunctions,
    data,
    isLoading,
    noDataMessage,
    rowProps
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
                        rowFunction={rowFunctions ? rowFunctions[i] : () => {}}
                        data={d}
                        // TODO: don't use index as key
                        // eslint-disable-next-line react/no-array-index-key
                        key={`column-${i}`}
                        rowProps={rowProps}
                    />
                ))}
            </div>
        ) : (
            <>{!isLoading &&
                <div 
                    style={{
                        background: theme.tokenBox,
                        borderRadius: theme.secondaryBorderRadius,
                        color: theme.primaryText,
                    }}
                    className="p-4 w-full flex items-center justify-center rounded-2xl opacity-75"
                >
                    {noDataMessage}
                </div>
            }</>
        )}
    </WidgetContainer>
);

export default GenericTable;