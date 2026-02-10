import { useEffect, useState, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { FileText } from "lucide-react";
// import ComparisonInputPage from "./ComparisonInputPage";

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
  //const [comparisonData, setComparisonData] = useState(null);
  const [all_results, setAll_results] = useState([]);
  const [error, setError] = useState(null);
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

    pdf.save("SMR Energy Results.pdf");
  };

  // Loading and error states
  if (!all_results || all_results.length === 0) {
    return <div className="p-6 text-center">Loading comparison results...</div>;
  }

  // UI
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {all_results.slice(0,3).map((res, index) => (
              <div className="bg-white rounded-lg shadow-md col-span-1">
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
                    <span className="text-base font-medium text-gray-600">Total Score Cost</span>
                    <span className="block font-semibold text-lg text-gray-800">
                      {res.total_score_cost_millions?.toLocaleString()} M$
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
        </div>
      </div>
    </div>
  );
};

export default ComparisonOutputPage;
