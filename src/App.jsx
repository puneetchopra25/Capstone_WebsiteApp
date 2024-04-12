import { useState, useEffect } from 'react';
import { Wind, Sun, Settings, LifeBuoy } from 'lucide-react';
import Sidebar, { SidebarItem } from './components/Sidebar';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import { pdfjs, Document, Page } from 'react-pdf';

import SolarEnergyPage from './pages/SolarEnergyPage';
import WindEnergyPage from './pages/WindEnergyPage';
import SettingsPage from './pages/SettingsPage';
import HelpPage from './pages/HelpPage';
import Windresultspage from './pages/Windresultspage';
import SolarResultsPage from './pages/Solarresultspage';
const App = () => {
  
  const [calculatedValues, setCalculatedValues] = useState(null);
  const [weibullPlotImage, setWeibullPlotImage] = useState('');
  const [powerCurvePlotImage, setPowerCurvePlotImage] = useState('');
  const [monthly_wind_energy,setMonthly_wind_energy] = useState('');
  const [range_plot_wind,setRange_plot_wind] = useState('');
  const [solarCalcValues, setSolarCalcValues] = useState(null);
  const [solarPlotImage, setSolarPlotImage] = useState('');
  // const handleDownloadPdf = () => {
  //   // Logic to generate and download the PDF
  //   console.log('PDF download initiated');
  // };
  const SectionDivider = () => (
    <div className="my-6 border-t-2 border-gray-700"></div> // Creates a horizontal line as a section divider
  );
  useEffect(() => {
    if (calculatedValues) {
      if (calculatedValues.weibull_pdf_wind_speed) {
        setWeibullPlotImage(calculatedValues.weibull_pdf_wind_speed);
      }
      if (calculatedValues.power_curve) {
        setPowerCurvePlotImage(calculatedValues.power_curve);
      }
      if (calculatedValues.wind_monthly_energy) {
        setMonthly_wind_energy(calculatedValues.wind_monthly_energy);
      }
      if (calculatedValues.range_plot_wind) {
        setRange_plot_wind(calculatedValues.range_plot_wind)
      }
    }
  }, [calculatedValues]);
  useEffect(() => {
    if (solarCalcValues) {
      // Assuming you have an image plot in your solar calculations
      if (solarCalcValues.solarPlotImage) {
        setSolarPlotImage(solarCalcValues.solarPlotImage);
      }
      // ...handle other solar calculation results
    }
  }, [solarCalcValues]);
  return (
    <Router>
      <div className="flex h-screen">
        <Sidebar>
          <SidebarItem icon={<Sun size={20} />} text="Solar Energy" to="/solar-energy" alert />
          <SidebarItem icon={<Wind size={20} />} text="Wind Energy" to="/wind-energy" alert />
          <SectionDivider/>
          <SidebarItem icon={<Settings size={20} />} text="Settings" to="/settings" />
          <SidebarItem icon={<LifeBuoy size={20} />} text="Help" to="/help" />
        </Sidebar>
        <div className="flex-grow bg-gray-300">
          <main>
            <Routes>
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/help" element={<HelpPage />} />
            </Routes>
            <Windresultspage
              calculatedValues={calculatedValues}
              weibullPlotImage={weibullPlotImage}
              powerCurvePlotImage={powerCurvePlotImage}
              monthly_wind_energy={monthly_wind_energy}
              range_plot_wind={range_plot_wind}
            />
            <SolarResultsPage
              solarCalcValues={solarCalcValues}
              solarPlotImage={solarPlotImage}
            />
            </main>
          </div>
          <div className="mr-0">
            <main className="flex-grow-0">
              <Routes>
                <Route 
                  path="/solar-energy" 
                  element={<SolarEnergyPage setSolarCalcValues={setSolarCalcValues} />} 
                />
                <Route
                  path="/wind-energy"
                  element={<WindEnergyPage setCalculatedValues={setCalculatedValues} />}
                />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
  );
};

export default App;
