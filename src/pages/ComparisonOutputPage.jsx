import { useEffect, useState, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { FileText } from "lucide-react";

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
  const [province, setProvince] = useState(null);
  const [nuclearBanned, setNuclearBanned] = useState(false);
  const contentRef = useRef(null);

  // Location legality check

  useEffect(() => {
    const runCheck = async () => {
      if (!ComparisonInputValues) return;
      const prov = await getProvinceFromCoordinates(
        ComparisonInputValues.latitude,
        ComparisonInputValues.longitude
      );
      setProvince(prov);
      setNuclearBanned(NUCLEAR_BANNED_PROVINCES.includes(prov));
    };
    runCheck();
  }, [ComparisonInputValues]);

  // Rank SMRs by LCOE

  const rankedSMRs = ComparisonCalcValues?.results
    ?.slice()
    ?.sort((a, b) => a.lcoe - b.lcoe);

  // Hitachi cooling water check
  // Assumption: must be within 10 km of large body of water
  const hitachiWaterOK =
    ComparisonInputValues?.distanceToWater_km !== undefined
      ? ComparisonInputValues.distanceToWater_km <= 10
      : false;

  // PDF export

  const downloadPDF = async () => {
    if (!contentRef.current) return;
    const canvas = await html2canvas(contentRef.current, {
      scale: 2,
      useCORS: true,
      scrollY: -window.scrollY
    });
    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(img, "PNG", 0, 0, width, height);
    pdf.save("PURESIM_Comparison_Results.pdf");
  };


  if (!ComparisonCalcValues)
    return <div className="p-6 text-center">Run simulation to view Comparison results.</div>;

  // UI

  return (
    <div
      ref={contentRef}
      className="py-8 px-4 mx-auto max-w-7xl space-y-6"
    >
      {/* Regulatory Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-400 text-yellow-900 p-4 rounded-xl">
        <strong>Regulatory Disclaimer</strong>
        <p className="text-sm mt-1">
          Nuclear legality is evaluated at the provincial/state level only.
          Federal, municipal, and indigenous approvals are not assessed.
        </p>
        <p className="text-sm mt-1">
          Location detected: <strong>{province || "Unknown"}</strong>
        </p>
        {nuclearBanned && (
          <p className="text-sm text-red-700 mt-2">
            ⚠ Nuclear reactors are restricted in this jurisdiction.
          </p>
        )}
      </div>

      {/* Title */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">
          SMR Economic Ranking (Lowest LCOE)
        </h2>
        <button
          onClick={downloadPDF}
          className="flex items-center py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl shadow"
        >
          Download PDF
          <FileText className="ml-2 w-5 h-5" />
        </button>
      </div>

      {/* Ranked SMRs */}
      <div className="space-y-4">
        {rankedSMRs.map((smr, idx) => (
          <div
            key={`${smr.vendor}-${smr.model}`}
            className={`rounded-xl p-5 shadow-md border ${
              idx === 0
                ? "border-green-500 bg-green-50"
                : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">
                #{idx + 1} {smr.vendor} – {smr.model}
              </h3>
              <span className="font-semibold text-lg">
                LCOE: ${smr.lcoe}/MWh
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
              <div>
                <span className="text-gray-500">Annual Energy</span>
                <div>{smr.annual_energy.toLocaleString()} MWh</div>
              </div>

              <div>
                <span className="text-gray-500">Capital Cost</span>
                <div>${smr.capital_cost.toLocaleString()}</div>
              </div>

              <div>
                <span className="text-gray-500">Cooling Required</span>
                <div>{smr.cooling_required ? "Yes" : "No"}</div>
              </div>

              <div>
                <span className="text-gray-500">Site Legal</span>
                <div className={nuclearBanned ? "text-red-600" : "text-green-600"}>
                  {nuclearBanned ? "No" : "Yes"}
                </div>
              </div>
            </div>

            {/* Hitachi-specific cooling constraint */}
            {smr.vendor === "Hitachi" && (
              <div
                className={`mt-3 text-sm ${
                  hitachiWaterOK ? "text-green-700" : "text-red-700"
                }`}
              >
                {hitachiWaterOK
                  ? "Cooling water requirement satisfied"
                  : "Insufficient proximity to large body of water"}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComparisonOutputPage;
