import { useState } from 'react';
import { Wind, Sun, Settings, LifeBuoy } from 'lucide-react';
import Sidebar, { SidebarItem } from './components/Sidebar';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import SolarEnergyPage from './pages/SolarEnergyPage';
import WindEnergyPage from './pages/WindEnergyPage';
import SettingsPage from './pages/SettingsPage';
import HelpPage from './pages/HelpPage';

const App = () => {
  
  const [calculatedValues, setCalculatedValues] = useState(null);
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
            {/* Display fetched usernames */}
            
            {calculatedValues && (
              <div>
                <p>Annual Energy: {calculatedValues.annual_energy}</p>
                <p>Capacity Factor: {calculatedValues.capacity_factor}</p>
              </div>
            )}
          </main>
        </div>
        <div className="mr-0">
          <main className="flex-grow-0">
            <Routes>
              <Route path="/solar-energy" element={<SolarEnergyPage />} />
              <Route
                path="/wind-energy"
                element={<WindEnergyPage setCalculatedValues={setCalculatedValues} />} // Pass setUsernames prop
              />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
