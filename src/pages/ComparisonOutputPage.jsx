import { useEffect, useState, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { FileText, HelpCircle } from "lucide-react";

// Provinces / states where nuclear is restricted
const NUCLEAR_BANNED_PROVINCES = [
  "British Columbia",
  "Nova Scotia",
  "Quebec",
  "California",
  "Minnesota",
  "Oregon",
  "Maine"
];

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

// Helper to get province from coordinates
const getProvinceFromCoordinates = async (lat, lng) => {
  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_ACCESS_TOKEN}`
    );
    const data = await res.json();
    const region = data.features.find((f) =>
      f.place_type.includes("region")
    );
    return region?.text || null;
  } catch (err) {
    console.error("Province lookup failed:", err);
    return null;
  }
};

const ComparisonOutputPage = ({ ComparisonCalcValues, ComparisonInputValues }) => {
  const [all_results, setAll_results] = useState([]);
  const [province, setProvince] = useState(null);
  const [nuclearBanned, setNuclearBanned] = useState(false);
  const contentRef = useRef(null);

  // Process Comparison results
  useEffect(() => {
    if (ComparisonCalcValues && ComparisonCalcValues.length > 0){
      setAll_results(ComparisonCalcValues);
      console.log("Rank results", ComparisonCalcValues);
    }
  }, [ComparisonCalcValues])

    // Location legality check
    useEffect(() => {
      const checkProvince = async () => {
        if (!ComparisonInputValues) return;
        const prov = await getProvinceFromCoordinates(
          ComparisonInputValues.latitude,
          ComparisonInputValues.longitude
        );
        setProvince(prov);
        setNuclearBanned(NUCLEAR_BANNED_PROVINCES.includes(prov));
      };
      checkProvince();
    }, [ComparisonInputValues]);

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

    pdf.save("Energy Recommendation Results.pdf");
  };

  // Loading and error states
  if (!all_results || all_results.length === 0) {
    return <div className="p-6 text-center">Loading comparison results...</div>;
  }

  // UI
  return (
    <div className="py-8 px-4 mx-auto max-w-7xl" style={{ maxHeight: "calc(113vh - 100px)", overflowY: "scroll" }}>
     
      <div className="flex justify-end items-center gap-6 mb-6 px-2">

        {/* FAQ */}
        <div className="group relative flex items-center text-gray-800 cursor-help transition-colors hover:text-blue-700">
          <HelpCircle className="w-5 h-5 mr-2" />
          <span className="text-base font-medium border-b border-dotted border-gray-400">
            How are these ranked?
          </span>
          <div className="invisible group-hover:visible absolute top-full right-0 mt-2 w-80 p-4 bg-gray-200 text-white text-sm rounded-lg shadow-xl z-50 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none border border-gray-700">
            <p className="leading-relaxed text-gray-800">
              Configurations are optimal combinations of SMR and Solar units which 
              are ranked based on their ability to meet load demand reliably 
              while minimizing the total cost. Rank 1 is the cheapest way 
              to reliably meet your demand over the entire project lifespan.
            </p>
          </div>
        </div>  

        {/*Download PDF Button*/}
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {all_results.slice(0,3).map((res, index) => (
              <div key = {res.configuration || index} className="bg-white rounded-lg shadow-md col-span-1">
                <div className="bg-gray-200 px-5 py-3">
                  <h3 className="text-xl font-bold text-gray-800 text-center">Rank {res.rank || index + 1}</h3>
                </div>
                
                <div className="px-6 py-4">
                  <div className="mb-3">
                    <span className="text-base font-medium text-gray-600">Configuration</span>
                    <span className="block font-semibold text-lg text-gray-800 leading-tight">
                      {res.configuration}
                    </span>
                  </div>

                  <div className="mb-3">
                    <span className="text-base font-medium text-gray-600">Total Lifecycle Cost</span>
                    <span className="block font-semibold text-lg text-gray-800">
                      ${res.total_score_cost_millions?.toLocaleString(undefined, { 
                        maximumFractionDigits: 0 
                      })}M
                    </span>
                  </div>

                  <div className="mb-3">
                    <span className="text-base font-medium text-gray-600">Standby Power Generation</span>
                    <span className="block font-semibold text-lg text-gray-800">
                      {res.annual_unmet_demand_mwh?.toLocaleString()} MWh/yr
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Generation Mix Plot */}
            {all_results[0]?.generation_mix_chart && (
              <div className="bg-white rounded-lg shadow-md p-4 mb-4 col-span-full flex flex-col items-center">
                <img
                  src={`data:image/png;base64,${all_results[0].generation_mix_chart}`}
                  alt="Generation Mix Chart"
                  style={{ width: "100%", maxWidth: "500px", height: "auto" }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonOutputPage;
