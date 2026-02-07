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
      console.log("Backend results:", SMRCalcValues.results);

      try {
        setSmrData({
          // model info
          model_name: SMRInputValues?.model_name || "SMR Module",
          num_units: SMRInputValues?.num_units || 1,
          refuel_cycle: res.refuel_cycle || 0,
          unit_power: res.unit_power || 0,
          unit_refuel_cost: res.unit_fuel_cost_usd || 0,
          cooling_required: res.cooling_required ? "Yes" : "No",

          // Energy results
          annual_energy_output: res.avg_annual_generation_mwh || 0,
          monthly_generation: Array(12).fill((res.avg_annual_generation_mwh || 0) / 12),
          chartImage: res.generation_chart_base64 || 0,

          // Financial results
          capital_cost: res.net_capital_cost_millions || 0,
          annual_cost: res.net_annual_cost_millions_yr || 0,
          annual_recurring_cost: res.net_annual_recurring_cost_millions_yr || 0,
          net_present_value_cost: res.net_present_value_cost_millions || 0,
          lcoe: res.lcoe || 0,         
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
  if (!contentRef.current) return;

  // Content
  const canvas = await html2canvas(contentRef.current, {
    scale: 2,
    useCORS: true,
    scrollY: -window.scrollY,
  });

  const imgData = canvas.toDataURL("image/png");

  // Create PDF size
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Page dimensions
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 5;

  // Image dimensions
  const imgWidth = pageWidth - margin * 2;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;
  let position = margin;

  pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
  heightLeft -= pageHeight - margin * 2;

  pdf.save("SMR Energy Results.pdf");
};


  // Loading and error states
  if (!SMRCalcValues) return <div className="p-6 text-center">Click "Simulate" to see SMR results.</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;
  if (!smrData) return <div className="p-6 text-center">Loading SMR results...</div>;

  const { annual_energy_output, monthly_generation, capital_cost, annual_cost, annual_recurring_cost, 
    net_present_value_cost, lcoe, unit_power, refuel_cycle, cooling_required} = smrData;
  const maxGen = Math.max(...monthly_generation || [0]);

  return (
    <div className="py-8 px-4 mx-auto max-w-7xl" style={{ maxHeight: "calc(113vh - 100px)", overflowY: "scroll" }}>
      
      {/*Download PDF Button*/}
      <div className="col-span-1 flex justify-end items-start mb-2">
        <button
          onClick={downloadPDF}
          className="flex items-center py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl transition duration-300 ease-in-out text-base shadow-lg">
          Download PDF
          <FileText className="ml-2 w-5 h-5" />
        </button>
      </div>
      
    <div ref={contentRef}>
      <div className="pdf-wrapper">

      {/* Nuclear ban warning */}
      {nuclearBanned && (
        <div className="bg-red-100 border-2 border-red-600 text-red-800 p-4 rounded-xl mb-4 mt-2">
          <strong>Nuclear reactors are restricted province/state-wide.</strong>
          <div className="text-sm mt-1">Selected province: {province}</div>
        </div>
      )}
{/*
       No body of water near Warning 
      {coolingWarning && (
        <div className="bg-red-100 border-2 border-red-600 text-red-800 p-4 rounded-xl mb-4 mt-2">
          <strong>This SMR requires cooling water, but the location is not near a body of water.</strong>
        </div>
      )}
*/}
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
              <span className="block font-semibold text-lg text-gray-800">
                ${annual_cost?.toLocaleString() ?? "0"} M
                </span>
            </div>
            <div className="mb-3">
              <span className="text-base font-medium text-gray-600">Capital Cost:</span>
              <span className="block font-semibold text-lg text-gray-800">
                ${capital_cost?.toLocaleString() ?? "0"} M
              </span>
            </div>
            <div className="mb-3">
              <span className="text-base font-medium text-gray-600">Annual Recurring Cost:</span>
              <span className="block font-semibold text-lg text-gray-800">
                ${annual_recurring_cost?.toLocaleString() ?? "0"} M
                </span>
            </div>
            <div className="mb-3">
              <span className="text-base font-medium text-gray-600">Present Value Cost:</span>
              <span className="block font-semibold text-lg text-gray-800">
                ${net_present_value_cost?.toLocaleString() ?? "0"} M
                </span>
            </div>
            <div className="mb-3">
              <span className="text-base font-medium text-gray-600">LCOE:</span>
              <span className="block font-semibold text-lg text-gray-800">
                ${lcoe?.toLocaleString() ?? "0"} M
                </span>
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

        {/*Plot*/}
        {smrData.chartImage && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-8 col-span-full">
            <img
              src={`data:image/png;base64,${smrData.chartImage}`}
              alt="Generation Chart"
              style={{ width: "100%", height: "auto", display: "block", margin: "0 auto" }}
            />
          </div>
        )}
      </div>
      </div>
    </div>
    </div>
  );
};

export default SMRResultsPage;
