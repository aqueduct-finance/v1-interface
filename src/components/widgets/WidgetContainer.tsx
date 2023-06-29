interface WidgetContainerProps {
    title: string;
    children: React.ReactNode;
    isUnbounded: boolean;
}

function WidgetContainer({
    title,
    children,
    isUnbounded,
}: WidgetContainerProps) {
    return (
        <div
            className={`flex flex-col w-full md:p-6 space-y-6 rounded-3xl md:bg-black dark:md:border-gray-800/60 dark:md:bg-gray-900/60 border-[2px] border-[#262626] transition ${
                !isUnbounded && "  max-w-xl "
            }`}
        >
            <div className="flex font-bold space-x-4 text-2xl whitespace-nowrap">
                {title && (
                    <div className="px-2 py-2 rounded-xl  w-min text-white">
                        {title}
                    </div>
                )}
            </div>
            {children}
        </div>
    );
}

export default WidgetContainer;
