import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRef } from "react";
import { FileText } from "lucide-react";

const monthLabels = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec"
];

const SMRResultsPage = ({ smrCalcValues }) => {
  const contentRef = useRef(null);

  if (!smrCalcValues) {
    return (
      <div className="flex justify-center items-center h-full text-gray-600 p-6">
        No SMR results available.
      </div>
    );
  }

  const {
    annual_energy_output,
    annual_cost,
    lcoe,
    monthly_generation,
    monthly_cost,
    model_name,
    num_units,
  } = smrCalcValues;

  const maxGen = Math.max(...monthly_generation);
  const maxCost = Math.max(...monthly_cost);

  const downloadPDF = async () => {
    if (contentRef.current) {
      const contentWidth = contentRef.current.scrollWidth;
      const contentHeight = contentRef.current.scrollHeight;

      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        width: contentWidth,
        height: contentHeight,
        useCORS: true,
      });

      const aspectRatio = contentWidth / contentHeight;
      const pdfWidth = 210;
      const pdfHeight = pdfWidth / aspectRatio;

      const pdf = new jsPDF({
        orientation: aspectRatio > 1 ? "landscape" : "portrait",
        unit: "mm",
        format: [pdfWidth, pdfHeight],
      });

      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("results_smr.pdf");
    }
  };

  return (
    <div
      className="py-8 px-4 mx-auto max-w-7xl"
      style={{ maxHeight: "calc(113vh - 100px)", overflowY: "scroll" }}
    >
      {/* -------- Top Section: Calculation + Cost + Download ------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Energy Results */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden col-span-1">
          <div className="bg-gray-200 px-5 py-3">
            <h3 className="text-xl font-bold text-gray-800 text-center">
              SMR Energy Results
            </h3>
          </div>
          <div className="px-6 py-4">
            
            {/* Annual Energy */}
            <div className="mb-3">
              <span className="text-base font-medium text-gray-600">
                Annual Energy Output
              </span>
              <span className="block font-semibold text-lg text-gray-800">
                {annual_energy_output.toLocaleString()} MWh/yr
              </span>
            </div>

            {/* LCOE */}
            <div className="mb-3">
              <span className="text-base font-medium text-gray-600">
                LCOE
              </span>
              <span className="block font-semibold text-lg text-gray-800">
                ${lcoe.toFixed(3)} / kWh
              </span>
            </div>

            {/* Number of Units */}
            <div className="mb-3">
              <span className="text-base font-medium text-gray-600">
                Number of SMR Units
              </span>
              <span className="block font-semibold text-lg text-gray-800">
                {num_units}
              </span>
            </div>

            {/* Model Name */}
            <div className="mb-3">
              <span className="text-base font-medium text-gray-600">
                SMR Model
              </span>
              <span className="block font-semibold text-lg text-gray-800">
                {model_name}
              </span>
            </div>
          </div>
        </div>

        {/* Cost Details */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden col-span-1">
          <div className="bg-gray-200 px-5 py-3">
            <h3 className="text-xl font-bold text-gray-800 text-center">
              Cost Details
            </h3>
          </div>
          <div className="px-6 py-4">

            {/* Annual Cost */}
            <div className="mb-3">
              <span className="text-base font-medium text-gray-600">
                Annual Cost:
              </span>
              <span className="block font-semibold text-lg text-gray-800">
                ${annual_cost.toLocaleString()}
              </span>
            </div>

            {/* Cost per Month */}
            <div className="mb-3">
              <span className="text-base font-medium text-gray-600">
                Avg. Monthly Cost:
              </span>
              <span className="block font-semibold text-lg text-gray-800">
                ${(annual_cost / 12).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* PDF Button */}
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

      {/* -------- Graphs Section -------- */}
      <div
        ref={contentRef}
        className="bg-white rounded-lg shadow-md overflow-hidden p-4 flex flex-col justify-between"
        style={{ height: "100%" }}
      >
        <h3 className="text-3xl font-bold text-gray-800 mb-4 text-center ml-12">
          Graphical Analysis
        </h3>

        {/* -------- Monthly Generation Bar Chart -------- */}
        <h4 className="text-lg font-semibold mb-2">Monthly Electricity Generation</h4>
        <div className="flex items-end gap-2 h-48 mb-8">
          {monthly_generation.map((value, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div
                className="w-6 bg-blue-500 rounded-t"
                style={{ height: `${(value / maxGen) * 100}%` }}
              ></div>
              <span className="text-xs mt-1">{monthLabels[idx]}</span>
            </div>
          ))}
        </div>

        {/* -------- Monthly Cost Bar Chart -------- */}
        <h4 className="text-lg font-semibold mb-2">Monthly Cost</h4>
        <div className="flex items-end gap-2 h-48 mb-8">
          {monthly_cost.map((value, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div
                className="w-6 bg-red-500 rounded-t"
                style={{ height: `${(value / maxCost) * 100}%` }}
              ></div>
              <span className="text-xs mt-1">{monthLabels[idx]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SMRResultsPage;
