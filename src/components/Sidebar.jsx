import { ChevronFirst, ChevronLast} from "lucide-react"
import logo_blue from "../assets/logo_blue.png"
{/*import logo_black from "../assets/logo_black.png"*/}
import { createContext, useContext, useState } from "react"
import { Link } from 'react-router-dom';

const SidebarContext = createContext();
export default function Sidebar({ children }) {
    const [expanded, setExpanded] = useState(true)
    return (
        <>
            <aside className="h-screen">
                <nav className="h-full flex flex-col bg-white border-r shadow-sm">
                    <div className="p-4 pb-2 flex justify-between items-center">
                        <img src={logo_blue} className={`overflow-hidden transition-all ${expanded ? "w-32" : "w-0"}`} />
                        <button onClick={() => setExpanded((curr) => !curr)} className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100">
                            {expanded ? <ChevronFirst /> : <ChevronLast />}
                        </button>
                        
                    </div>

                    <SidebarContext.Provider value={{ expanded }}>
                        <ul className="flex-1 px-3">{children}</ul>
                    </SidebarContext.Provider>
                </nav>
            </aside>
        </>
    )
}

{/*export function SidebarItem({ icon, text, to }) {
    const { expanded } = useContext(SidebarContext);
    return (
        <li className={`relative flex items-center py-2 px-3 my-1 font-medium rounded-md cursor-pointer transition-colors ${expanded ? "hover:bg-gradient-to-tr from-indigo-200 to-indigo-100 hover:text-indigo-800" : "hover:bg-indigo-50"} text-gray-600`}>
                    <Link to={to} className="flex items-center w-full">
                        {icon}
                        <span className={`ml-3 overflow-hidden transition-all duration-300 ${expanded ? "inline" : "hidden"}`}>{text}</span>
                    </Link>

            {!expanded && (
                <div className={`absolute left-full rounded-md px-2 py-1 ml-6 bg-indigo-100 text-indigo-800 text-sm invisible opacity-0 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0`}>
                    {text}
                </div>
            )}
        </li>
    )
}*/}

export function SidebarItem({ icon, text, to }) {
    const { expanded } = useContext(SidebarContext);
  
    return (
      <li className={`relative flex items-center py-2 px-3 my-1 font-medium rounded-md 
                        cursor-pointer transition-colors 
                        ${expanded ? "hover:bg-gradient-to-tr from-indigo-200 to-indigo-100 hover:text-indigo-800" : "hover:bg-indigo-50"}
                        text-gray-600`}>
        <Link to={to} className="flex items-center w-full">
          {icon}
          <span className={`ml-3 overflow-hidden transition-all duration-300 ${expanded ? "inline" : "hidden"}`}>{text}</span>
        </Link>
        {!expanded && (
                <div className={`absolute left-full rounded-md px-2 py-1 ml-6 bg-indigo-100 text-indigo-800 text-sm invisible opacity-0 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0`}>
                    {text}
                </div>
            )}
      </li>
    );
  }