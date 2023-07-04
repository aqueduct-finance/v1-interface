/* eslint-disable react/require-default-props, react/jsx-no-useless-fragment */
import { ExplicitAny } from "../../types/ExplicitAny";
import WidgetContainer from "../widgets/WidgetContainer";
import TableRow from "./TableRow";

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
    <WidgetContainer padding="md:p-4" title={title} isUnbounded>
        <div className="flex px-4 text-xl text-white">
            {labels.map((label, i) => (
                <div className={columnProps[i]} key={label}>
                    {label}
                </div>
            ))}
        </div>
        {isLoading && (
            <div className="flex flex-col space-y-2">
                {[0, 1, 2].map((i) => (
                    <div
                        className="w-full p-4 text-transparent bg-item dark:bg-aqueductBlue/30 rounded-2xl animate-pulse"
                        key={`loading-${i}`}
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
        )}
    </WidgetContainer>
);

export default GenericTable;