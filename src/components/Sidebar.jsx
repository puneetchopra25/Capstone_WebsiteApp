
import { ChevronFirst, ChevronLast } from "lucide-react";
import pure_sim from "../assets/puresim_2_logo-removebg-preview.png";
//import logo_black from "../assets/logo_black.png";
import { createContext, useContext, useState } from "react";
import { NavLink } from 'react-router-dom';

const SidebarContext = createContext();

export default function Sidebar({ children }) {
    const [expanded, setExpanded] = useState(true);

    return (
        <>
            <aside className={`h-screen ${expanded ? 'w-64' : 'w-16'} transition-width duration-300`}>
                <nav className="h-full flex flex-col border-r shadow-sm bg-gray-200">
                    <div className="p-4 pb-2 flex justify-between items-center ">
                        <img src={pure_sim} className={`overflow-hidden transition-all duration-300 ${expanded ? "w-44" : "w-0"}`} alt="Logo" />
                        {/* <h2 className="text-blue-500 font-bold italic text-2xl overflow-hidden transition-all duration-300">PURE-SIM</h2> */}
                        <button onClick={() => setExpanded((curr) => !curr)} className="p-1.5 rounded-lg bg-gray-300 hover:bg-gray-400">
                            {expanded ? <ChevronFirst size={20} /> : <ChevronLast size={20} />}
                        </button>
                    </div>

                    <SidebarContext.Provider value={{ expanded }}>
                        <ul className="flex-1 px-3">{children}</ul>
                    </SidebarContext.Provider>
                </nav>
            </aside>
        </>
    );
}

export function SidebarItem({ icon, text, to }) {
    const { expanded } = useContext(SidebarContext);
    const activeClassName = "bg-blue-500 text-white"; // Tailwind classes for active link

    return (
        <li className="relative group text-white">
            <NavLink
                to={to}
                className={({ isActive }) =>
                    `flex items-center py-2 px-3 my-1 font-medium rounded-md cursor-pointer transition-colors ${isActive ? activeClassName : "text-gray-600 hover:bg-gray-300"}`
                }
            >
                {icon}
                <span className={`ml-3 overflow-hidden transition-all duration-300 ${expanded ? "inline" : "hidden"}`}>{text}</span>
            </NavLink>
            {!expanded && (
                <div className={`absolute left-full rounded-md px-2 py-1 ml-6 bg-indigo-100 text-indigo-800 text-sm invisible group-hover:visible transition-all duration-300 ease-in-out`}>
                    {text}
                </div>
            )}
        </li>
    );
}

