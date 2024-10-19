import { ChevronFirst, ChevronLast } from "lucide-react";
import pure_sim from "../assets/puresim_2_logo-removebg-preview.png";
//import logo_black from "../assets/logo_black.png";
import { createContext, useContext, useState } from "react";
import { NavLink } from "react-router-dom";

const SidebarContext = createContext();

export default function Sidebar({ children }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <>
      <aside
        className={`h-screen ${
          expanded ? "w-64" : "w-16"
        } transition-width duration-300`}
      >
        <nav className="h-full flex flex-col border-r shadow-sm bg-gray-200">
          <div className="p-4 pb-2 flex justify-between items-center ">
            <NavLink
              to="/"
              className={`overflow-hidden transition-all duration-300 ${
                expanded ? "w-44" : "w-0"
              }`}
            >
              <img src={pure_sim} alt="Logo" />
            </NavLink>
            {/* <h2 className="text-blue-500 font-bold italic text-2xl overflow-hidden transition-all duration-300">PURE-SIM</h2> */}
            <div className="relative group">
              <button
                onClick={() => setExpanded((curr) => !curr)}
                className="p-1.5 rounded-lg bg-gray-300 hover:bg-gray-400"
              >
                {expanded ? (
                  <ChevronFirst size={20} />
                ) : (
                  <ChevronLast size={20} />
                )}
              </button>

              <span className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 whitespace-nowrap px-2 py-1 bg-gray-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {expanded ? "Collapse" : "Expand"}
              </span>
            </div>
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
  const nonActiveClassName = "text-gray-600 hover:bg-gray-300"; // Tailwind classes for non-active link

  return (
    <li className="relative group text-white my-2">
      {" "}
      {/* Add margin here to separate items */}
      <NavLink
        to={to}
        className={({ isActive }) =>
          `flex items-center py-2 px-3 my-1 font-medium rounded-md cursor-pointer transition-colors ${
            isActive ? activeClassName : nonActiveClassName
          }`
        }
      >
        <span
          className="flex items-center justify-center w-6 h-6" // Fixed width and height for the icon
        >
          {icon}
        </span>
        <span
          className={`ml-3 overflow-hidden transition-all duration-300 ${
            expanded ? "inline" : "hidden"
          }`}
        >
          {text}
        </span>
      </NavLink>
      {!expanded && (
        <div
          className={`absolute left-full rounded-md px-2 py-1 ml-6 bg-gray-600 text-white text-sm invisible group-hover:visible transition-all duration-300 ease-in-out w-32 text-center`}
          style={{ top: "50%", transform: "translateY(-50%)" }}
        >
          {text}
        </div>
      )}
    </li>
  );
}
