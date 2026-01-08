import { useState, useEffect } from "react";
import { Wind, Sun, Waves, Atom, GitMerge } from "lucide-react";
import Sidebar, { SidebarItem } from "./components/Sidebar";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
// import { pdfjs, Document, Page } from 'react-pdf';

// import each page
import SolarEnergyPage from "./pages/SolarEnergyPage";
import WindEnergyPage from "./pages/WindEnergyPage";
import HydroEnergyPage from "./pages/HydroEnergyPage";
import SMREnergyPage from "./pages/SMREnergyPage";

import Windresultspage from "./pages/Windresultspage";
import SolarResultsPage from "./pages/Solarresultspage";
import HydroResultsPage from "./pages/HydroResultspage";
import SMRResultsPage from "./pages/SMRresultspage";

import WelcomePage from "./pages/WelcomePage";
import SettingsPage from "./pages/SettingsPage";
import HelpPage from "./pages/HelpPage";
import { SectionDivider } from "./components/SectionDivider";

// input page to result page
const App = () => {
  // Wind Component States
  const [calculatedValues, setCalculatedValues] = useState(null);
  const [weibullPlotImage, setWeibullPlotImage] = useState("");
  const [powerCurvePlotImage, setPowerCurvePlotImage] = useState("");
  const [monthly_wind_energy, setMonthly_wind_energy] = useState("");
  const [range_plot_wind, setRange_plot_wind] = useState("");
  // Solar Component States
  const [solarCalcValues, setSolarCalcValues] = useState(null);
  const [solarPlotImage, setSolarPlotImage] = useState("");
  const [cashflowPlotImage, setCashflowPlotImage] = useState("");
  const [omcostPlotImage, setOmcostPlotImage] = useState("");
  const [recieptPlotImage, setRecieptPlotImage] = useState("");
  const [systemCapacityOrArea, setSystemCapacityOrArea] = useState(false);
  // Hydro Component States
  const [hydroCalcValues, setHydroCalcValues] = useState(null);
  const [hydroInputValues, setHydroInputValues] = useState(null);
  // SMR Component States
  const [SMRCalcValues, setSMRCalcValues] = useState(null);
  const [SMRInputValues, setSMRInputValues] = useState(null);

  // const handleDownloadPdf = () => {
  //   // Logic to generate and download the PDF
  //   console.log('PDF download initiated');
  // };

  // Wind Component
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
        setRange_plot_wind(calculatedValues.range_plot_wind);
      }
    }
  }, [calculatedValues]);

  // Solar Component
  useEffect(() => {
    if (solarCalcValues) {
      // Assuming you have an image plot in your solar calculations
      if (solarCalcValues.monthly_plot_solar) {
        setSolarPlotImage(solarCalcValues.monthly_plot_solar);
      }
      if (solarCalcValues.cash_flowplot) {
        setCashflowPlotImage(solarCalcValues.cash_flowplot);
      }
      if (solarCalcValues.om_costplot) {
        setOmcostPlotImage(solarCalcValues.om_costplot);
      }
      if (solarCalcValues.recieptplot) {
        setRecieptPlotImage(solarCalcValues.recieptplot);
      }
      // ...handle other solar calculation results
    }
  }, [solarCalcValues]);

  // multiple pages and screen 3 column layout
  return (
    <Router>
      <div className="flex h-screen">
        <Sidebar>
          <SidebarItem
            icon={<Sun size={20} />}
            text="Solar Energy"
            to="/solar-energy"
            alert
          />
          <SidebarItem
            icon={<Wind size={20} />}
            text="Wind Energy"
            to="/wind-energy"
            alert
          />
          <SidebarItem
            icon={<Waves size={20} />}
            text="Hydro Energy"
            to="/hydro-energy"
          />
          <SidebarItem
            icon={<Atom size={20} />}
            text="SMR Energy"
            to="/smr-energy"
          />
          <SidebarItem
            icon={<GitMerge size={20} />}
            text="Energy Selection"
            to="/Energy Selection"
          />
          <SectionDivider />

          {/* <SidebarItem icon={<LifeBuoy size={20} />} text="Help" to="/help" /> */}
        </Sidebar>
        <div className="flex-grow bg-gray-300">
          <main>
            <Routes>
              <Route path="/" element={<WelcomePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/help" element={<HelpPage />} />
            </Routes>
            
            {/* results page middle column */}
            {calculatedValues && (
              <Windresultspage
                calculatedValues={calculatedValues}
                weibullPlotImage={weibullPlotImage}
                powerCurvePlotImage={powerCurvePlotImage}
                monthly_wind_energy={monthly_wind_energy}
                range_plot_wind={range_plot_wind}
              />
            )}
            {solarCalcValues && (
              <SolarResultsPage
                solarCalcValues={solarCalcValues}
                solarPlotImage={solarPlotImage}
                systemCapacityOrArea={systemCapacityOrArea}
                recieptPlotImage={recieptPlotImage}
                omcostPlotImage={omcostPlotImage}
                cashflowPlotImage={cashflowPlotImage}
              />
            )}
            {hydroCalcValues && (
              <HydroResultsPage
                hydroCalcValues={hydroCalcValues}
                hydroInputValues={hydroInputValues}
              />
            )}
            {SMRCalcValues && (
              <SMRResultsPage
                SMRCalcValues = {SMRCalcValues}
                SMRInputValues = {SMRInputValues}
                />
            )}
          </main>
        </div>
        <div className="mr-0">
          <main className="flex-grow-0">
            
            {/* right side input panel */}
            <Routes>
              <Route
                path="/solar-energy"
                element={
                  <SolarEnergyPage
                    setSolarCalcValues={setSolarCalcValues}
                    systemCapacityOrArea={systemCapacityOrArea}
                    setSystemCapacityOrArea={setSystemCapacityOrArea}
                  />
                }
              />
              <Route
                path="/wind-energy"
                element={
                  <WindEnergyPage 
                    setCalculatedValues={setCalculatedValues} />
                }
              />
              <Route
                path="/hydro-energy"
                element={
                  <HydroEnergyPage
                    setHydroCalcValues={setHydroCalcValues}
                    setHydroInputValues={setHydroInputValues}
                  />
                }
              />
              <Route
                path="/smr-energy"
                element={
                  <SMREnergyPage
                    setSMRCalcValues={setSMRCalcValues}
                    setSMRInputValues={setSMRInputValues}
                  />
                }
                />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
