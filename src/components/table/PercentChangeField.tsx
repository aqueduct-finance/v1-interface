import { TbTriangleFilled, TbTriangleInvertedFilled } from 'react-icons/tb'

function PercentChangeField({ change }: { change: number }) {
    return (
        <div className="monospace-font text-sm font-semibold ">
            <div className={`${change >= 0 ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'} flex items-center justify-center space-x-1 w-min rounded-lg px-3 p-2 `}>
                {
                    change >= 0
                    ?
                    <TbTriangleFilled size={8} />
                    :
                    <TbTriangleInvertedFilled size={8} />
                }
                <p>
                    {change != undefined ? `${change.toFixed(2)}%` : '---'}
                </p>
            </div>
        </div>
    );
}

export default PercentChangeField;
