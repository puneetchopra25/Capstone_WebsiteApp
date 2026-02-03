import { useEffect, useState, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { FileText } from "lucide-react";


// Provinces where nuclear reactors are banned
const NUCLEAR_BANNED_PROVINCES = [
  "British Columbia",
  "Nova Scotia",
  "Quebec",
  "California",
  "Minnesota",
  "Oregon",
  "Maine"
];

// Replace with your Mapbox token
const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

// Helper to get province from coordinates
const getProvinceFromCoordinates = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_ACCESS_TOKEN}`
    );
    const data = await response.json();
    const regionFeature = data.features.find((f) =>
      f.place_type.includes("region")
    );
    return regionFeature?.text || null;
  } catch (err) {
    console.error("Error fetching province:", err);
    return null;
  }
};

const SMRResultsPage = ({ SMRCalcValues, SMRInputValues }) => {
  const [smrData, setSmrData] = useState(null);
  const [error, setError] = useState(null);
  const [province, setProvince] = useState(null);
  const [nuclearBanned, setNuclearBanned] = useState(false);
  const contentRef = useRef(null);

  // Process SMR calculation results
  useEffect(() => {
    if (SMRCalcValues && SMRCalcValues.results) {
      const res = SMRCalcValues.results;
      try {
        setSmrData({
          // model info
          model_name: SMRInputValues?.modelName || "SMR Module",
          num_units: SMRInputValues?.numUnits || 1,
          refuel_cycle: res.refuel_cycle_months,
          unit_power: res.power_mw || 0,
          unit_refuel_cost: res.unit_fuel_cost_usd || 0,
          cooling_required: res.cooling_required ? "Yes" : "No",

          // Energy results
          annual_energy_output: res.average_annual_generation,
          monthly_generation: Array(12).fill((res.average_annual_generation || 0) / 12),

          // Financial results
          annual_cost: res.net_annual_cost,
          lcoe: res.lcoe,
          capital_cost: res.capital_cost
        });
      } catch (err) {
        console.error(err);
        setError("Failed to process SMR data.");
      }
    }
  }, [SMRCalcValues, SMRInputValues]);

  // Check province and nuclear ban
  useEffect(() => {
    const checkProvince = async () => {
      if (!SMRInputValues) return;
      const prov = await getProvinceFromCoordinates(
        SMRInputValues.latitude,
        SMRInputValues.longitude
      );
      setProvince(prov);
      setNuclearBanned(NUCLEAR_BANNED_PROVINCES.includes(prov));
    };
    checkProvince();
  }, [SMRInputValues]);

  // PDF download
  const downloadPDF = async () => {
    if (contentRef.current) {
      const canvas = await html2canvas(contentRef.current, { scale: 2, useCORS: true, scrollY: -window.scrollY });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, width, height);
      pdf.save("SMR_results.pdf");
    }
  };

  // Loading and error states
  if (!SMRCalcValues) return <div className="p-6 text-center">Click "Simulate" to see SMR results.</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;
  if (!smrData) return <div className="p-6 text-center">Loading SMR results...</div>;

  const { annual_energy_output, annual_cost, lcoe, monthly_generation, monthly_cost, model_name, num_units, cooling_required, refuel_cycle, unit_power, unit_refuel_cost, capital_cost } = smrData;
  const maxGen = Math.max(...monthly_generation || [0]);
  const maxCost = Math.max(...monthly_cost ||[0]);

  return (
    <div className="py-8 px-4 mx-auto max-w-7xl" style={{ maxHeight: "calc(113vh - 100px)", overflowY: "scroll" }}>
      
      {/* Nuclear ban warning */}
      {nuclearBanned && (
        <div className="bg-red-100 border-2 border-red-600 text-red-800 p-4 rounded-xl mb-4">
          <strong>Nuclear reactors are restricted province/state-wide.</strong>
          <div className="text-sm mt-1">Selected province: {province}</div>
        </div>
      )}

      {/* Energy Results */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md col-span-1">
          <div className="bg-gray-200 px-5 py-3">
            <h3 className="text-xl font-bold text-gray-800 text-center">Energy Results</h3>
          </div>
          <div className="px-6 py-4">
            <div className="mb-3">
              <span className="text-base font-medium text-gray-600">Annual Energy</span>
              <span className="block font-semibold text-lg text-gray-800">{annual_energy_output?.toLocaleString() ?? "0"} MWh</span>
            </div>
            <div className="mb-3">
              <span className="text-base font-medium text-gray-600">Average Monthly Generation</span>
              <span className="block font-semibold text-lg text-gray-800">{maxGen?.toLocaleString() ?? "0"} MWh</span>
            </div>
          </div>
        </div>

        {/* Financial Results */}
        <div className="bg-white rounded-lg shadow-md col-span-1">
          <div className="bg-gray-200 px-5 py-3">
            <h3 className="text-xl font-bold text-gray-800 text-center">Financial Results</h3>
          </div>
          <div className="px-6 py-4">
            <div className="mb-3">
              <span className="text-base font-medium text-gray-600">Annual Cost:</span>
              <span className="block font-semibold text-lg text-gray-800">${annual_cost?.toLocaleString() ?? "0"}</span>
            </div>
            <div className="mb-3">
              <span className="text-base font-medium text-gray-600">Capital Cost:</span>
              <span className="block font-semibold text-lg text-gray-800">
                ${capital_cost?.toLocaleString() ?? "0"}
              </span>
            </div>
            <div className="mb-3">
              <span className="text-base font-medium text-gray-600">LCOE:</span>
              <span className="block font-semibold text-lg text-gray-800">${lcoe?.toLocaleString() ?? "0"}</span>
            </div>
          </div>
        </div>

       {/*Model Information*/}
        <div className="bg-white rounded-lg shadow-md col-span-1">
          <div className="bg-gray-200 px-5 py-3">
            <h3 className="text-xl font-bold text-gray-800 text-center">Model Information</h3>
          </div>
          <div className="px-6 py-4">
            <div className="mb-3">
              <span className="text-base font-medium text-gray-600">Unit Power:</span>
              <span className="block font-semibold text-lg text-gray-800">{unit_power} MW</span>
            </div>
            <div className="mb-3">
              <span className="text-base font-medium text-gray-600">Refuel Cycle:</span>
              <span className="block font-semibold text-lg text-gray-800">{refuel_cycle} months</span>
            </div>
            <div className="mb-3">
              <span className="text-base font-medium text-gray-600">Cooling required:</span>
              <span className="block font-semibold text-lg text-gray-800">{cooling_required}</span>
            </div>
          </div>
        </div>

        <div className="col-span-1 flex justify-end items-start">
          <button
            onClick={downloadPDF}
            className="flex items-center py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl transition duration-300 ease-in-out text-base shadow-lg"
          >
            Download PDF
            <FileText className="ml-2 w-5 h-5" />
          </button>
        </div>
      </div>

{/*   
      <div ref={contentRef} className="bg-white rounded-lg shadow-md p-4 flex flex-col" style={{ minHeight: "400px" }}>
        <h3 className="text-3xl font-bold text-gray-800 mb-4 text-center ml-12">Graphical Analysis</h3>

        <h4 className="text-lg font-semibold mb-2">Monthly Electricity Generation</h4>
        <div className="flex items-end gap-16 h-64 mb-10">
          {monthly_generation.map((value, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div className="w-6 bg-blue-500 rounded-t" style={{ height: `${(value / maxGen) * 100}%` }}></div>
              <span className="text-sm mt-1">{monthLabels[idx]}</span>
            </div>
          ))}
        </div>

        <h4 className="text-lg font-semibold mb-2">Monthly Cost</h4>
        <div className="flex items-end gap-16 h-64 mb-8">
          {monthly_cost.map((value, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div className="w-6 bg-red-500 rounded-t" style={{ height: `${(value / maxCost) * 100}%` }}></div>
              <span className="text-sm mt-1">{monthLabels[idx]}</span>
            </div>
          ))}
        </div>
      </div>
  */}
    </div>
  );
};

export default SMRResultsPage;
