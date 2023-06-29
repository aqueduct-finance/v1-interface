import { IconContext } from "react-icons";
import { CgArrowsExpandRight } from "react-icons/cg";
import Link from "next/link";
import { useMemo } from "react";
import { ExplicitAny } from "../../types/ExplicitAny";

interface TableRowProps {
    columnProps: string[];
    columnComponents: ((...args: ExplicitAny) => JSX.Element)[];
    link: string;
    data: ExplicitAny[];
}

const TableRow = ({
    columnProps,
    columnComponents,
    link,
    data,
}: TableRowProps) => {
    const color = useMemo(() => ({ color: "rgb(255 255 255 / 0.5)" }), []);
    return (
        <Link href={link} data-test-id="table-row-link">
            <div
                className="relative flex p-4 items-center bg-item rounded-xl hover:border-[#262626] border-2 border-transparent cursor-pointer transition-all duration-300"
                aria-label="Table row"
            >
                {data.map((d, i) => (
                    // TODO: don't use index as key
                    // eslint-disable-next-line react/no-array-index-key
                    <div className={columnProps[i]} key={`row-${i}`}>
                        {columnComponents[i](d)}
                    </div>
                ))}
                <div className="absolute right-4 hidden xs:ml-12 xs:flex">
                    <IconContext.Provider value={color}>
                        <CgArrowsExpandRight />
                    </IconContext.Provider>
                </div>
            </div>
        </Link>
    );
};

export default TableRow;