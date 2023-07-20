import { ReactNode } from "react";

const NavLink = ({
    title,
    link
}: {
    title: string;
    link: string;
}) => {
    return (
        <a href={link} rel="noopener noreferrer">
            < div
                className="flex space-x-2 mt-3 items-center justify-center bg-[#272727] text-white px-5 py-2 rounded-xl text-xl"
            >
                < p > {title}</p >
            </div >
        </a >
    );
};

export default NavLink;