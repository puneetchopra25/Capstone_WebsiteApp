import { Wind, Sun, Settings, LifeBuoy } from "lucide-react";
import Sidebar, { SidebarItem } from "./components/Sidebar"
{/*import Header from "./components/Header";*/}
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';

import SolarEnergyPage from "./pages/SolarEnergyPage";
import WindEnergyPage from "./pages/WindEnergyPage";
import SettingsPage from "./pages/SettingsPage";
import HelpPage from "./pages/HelpPage";

const App = () => {
  return (
    <Router>
      <div className="flex h-screen">
        <Sidebar>
          <SidebarItem icon={<Sun size={20} />} text="Solar Energy" to="/solar-energy" alert />
          <SidebarItem icon={<Wind size={20} />} text="Wind Energy" to="/wind-energy" alert />
          <hr className="my-3" />
          <SidebarItem icon={<Settings size={20} />} text="Settings" to="/settings" />
          <SidebarItem icon={<LifeBuoy size={20} />} text="Help" to="/help" />
        </Sidebar>
        <div className="flex-grow bg-gray-100">
          <main>
            <Routes>
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/help" element={<HelpPage />} />
            </Routes>
        </main>
        </div>
        <div className="mr-0">
          <main className="flex-grow-0"> {/* Remove flex-grow to prevent it from taking up unnecessary space */}
            <Routes>
              <Route path="/solar-energy" element={<SolarEnergyPage />} />
              <Route path="/wind-energy" element={<WindEnergyPage />} />
            </Routes>
          </main>
        </div>
        
      </div>
      
    </Router>
  );
}

export default App;