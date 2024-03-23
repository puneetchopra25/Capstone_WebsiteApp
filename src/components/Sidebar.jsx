
import { ChevronFirst, ChevronLast } from "lucide-react";
import logo_blue from "../assets/logo_blue.png";
//import logo_black from "../assets/logo_black.png";
import { createContext, useContext, useState } from "react";
import { NavLink } from 'react-router-dom';

const SidebarContext = createContext();

export default function Sidebar({ children }) {
    const [expanded, setExpanded] = useState(true);

    return (
        <>
            <aside className={`h-screen ${expanded ? 'w-64' : 'w-16'} transition-width duration-300`}>
                <nav className="h-full flex flex-col bg-white border-r shadow-sm">
                    <div className="p-4 pb-2 flex justify-between items-center">
                        <img src={logo_blue} className={`overflow-hidden transition-all duration-300 ${expanded ? "w-44" : "w-0"}`} alt="Logo" />
                        
                        <button onClick={() => setExpanded((curr) => !curr)} className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100">
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
        <li className="relative group">
            <NavLink
                to={to}
                className={({ isActive }) =>
                    `flex items-center py-2 px-3 my-1 font-medium rounded-md cursor-pointer transition-colors ${isActive ? activeClassName : "text-gray-600 hover:bg-gray-200"}`
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
// import { ChevronFirst, ChevronLast } from "lucide-react";
// import logo_blue from "../assets/logo_blue.png";
// import { createContext, useContext, useState } from "react";
// import { NavLink } from 'react-router-dom';

// const SidebarContext = createContext();

// export default function Sidebar({ children }) {
//     const [expanded, setExpanded] = useState(true);

//     return (
//         <>
//             <aside className={`h-screen ${expanded ? 'w-64' : 'w-16'} transition-all duration-300 ease-in-out`}>
//                 <nav className="h-full flex flex-col bg-white border-r shadow-sm">
//                     <div className="flex flex-col items-center p-4">
//                         <div className="flex items-center justify-center">
//                             <img src={logo_blue} alt="Logo" className={`transition-all duration-300 ${expanded ? "w-37 h-auto" : "w-0 h-0"}`} />
//                             <button
//                                 onClick={() => setExpanded((curr) => !curr)}
//                                 className="ml-4 p-1.5 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors"
//                             >
//                                 {expanded ? <ChevronFirst size={20} /> : <ChevronLast size={20} />}
//                             </button>
//                         </div>
//                         {expanded && (
//                             <span className="mt-2 text-left text-sm font-medium text-gray-600">
//                                 PURE Simulator
//                             </span>
//                         )}
//                     </div>
//                     <SidebarContext.Provider value={{ expanded }}>
//                         <ul className="flex-1">{children}</ul>
//                     </SidebarContext.Provider>
//                 </nav>
//             </aside>
//         </>
//     );
// }
// export function SidebarItem({ icon, text, to }) {
//     const { expanded } = useContext(SidebarContext);
//     const activeClassName = "bg-blue-500 text-white"; // Tailwind classes for active link

//     return (
//         <li className="relative group">
//             <NavLink
//                 to={to}
//                 className={({ isActive }) =>
//                     `flex items-center py-2 px-3 my-1 font-medium rounded-md cursor-pointer transition-colors ${isActive ? activeClassName : "text-gray-600 hover:bg-gray-200"}`
//                 }
//             >
//                 {icon}
//                 <span className={`ml-3 overflow-hidden transition-all duration-300 ${expanded ? "inline" : "hidden"}`}>{text}</span>
//             </NavLink>
//             {!expanded && (
//                 <div className={`absolute left-full rounded-md px-2 py-1 ml-6 bg-indigo-100 text-indigo-800 text-sm invisible group-hover:visible transition-all duration-300 ease-in-out`}>
//                     {text}
//                 </div>
//             )}
//         </li>
//     );
// }
