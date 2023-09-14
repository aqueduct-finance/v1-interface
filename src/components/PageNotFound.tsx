import Link from "next/link";
import { IoReturnUpBack } from "react-icons/io5";

const PageNotFound = () => (
    <div className="flex flex-col items-center justify-center space-y-4 pt-8 2poppins-font">
        <p className="text-2xl font-semibold">
            Position not found
        </p>
        <div className="text-white/50 space-y-2">
            <p className="text-white/50">
                - check that your swap is active
            </p>
            <p className="text-white/50">
                - check that the url is correct
            </p>
        </div>
        <Link href="/">
            <div className="mt-4 flex space-x-2 items-center justify-center text-white/50 whitespace-nowrap hover:text-white transition-all duration-300 rounded-2xl bg-item px-4 py-2">
                <p>
                    Go back
                </p>
                <IoReturnUpBack />
            </div>
        </Link>
    </div>
);

export default PageNotFound;