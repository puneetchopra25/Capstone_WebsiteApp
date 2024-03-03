import { Wind, Sun, Settings, LifeBuoy } from "lucide-react";
import Sidebar, { SidebarItem } from "./components/Sidebar"
{/*import Header from "./components/Header";*/}
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import SolarEnergyPage from "./pages/SolarEnergyPage";
import WindEnergyPage from "./pages/WindEnergyPage";
import SettingsPage from "./pages/SettingsPage";
import HelpPage from "./pages/HelpPage";
function App() {

  return (
    <Router>
      <div>
          <div className="flex">
            <Sidebar>
              <SidebarItem icon={<Sun size={20} />} text="Solar Energy" to="/solar-energy" alert />
              <SidebarItem icon={<Wind size={20} />} text="Wind Energy" to="/wind-energy" active />
              <hr className="my-3" />
              <SidebarItem icon={<Settings size={20} />} text="Settings" to="/settings" />
              <SidebarItem icon={<LifeBuoy size={20} />} text="Help" to="/help" />
            </Sidebar>

            <main>
              <Routes>
                <Route path="/solar-energy" element={<SolarEnergyPage />} />
                <Route path="/wind-energy" element={<WindEnergyPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/help" element={<HelpPage />} />
              </Routes>
            </main>
          </div>
      </div>
    </Router>
  )
}

export default App;