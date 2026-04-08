import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRef } from "react";
import { FileText } from "lucide-react";

const SolarResultsPage = ({ solarCalcValues, solarPlotImage, cashflowPlotImage, omcostPlotImage, recieptPlotImage }) => {
  const contentRef = useRef(null);

  if (!solarCalcValues) {
    return (
      <div className="flex justify-center items-center h-full text-gray-600 p-6">
        No solar results available.
      </div>
    );
  }

  // Map API response to component fields
  const {
    annual_energy_s,
    capacity_factor_solar,
    gen_Rev,
    initial_cost,
    main_cost,
    payback_period,
  } = solarCalcValues;

  // Parse string values with commas to numbers
  const annualEnergyOutput = annual_energy_s ? parseFloat(annual_energy_s.replace(/,/g, '')) : 0;
  const annualCost = initial_cost ? parseFloat(initial_cost.replace(/,/g, '')) : 0;
  const annualRevenue = gen_Rev ? parseFloat(gen_Rev.replace(/,/g, '')) : 0;
  
  // For LCOE calculation, we'll use the annual cost divided by annual energy
  const lcoe = annualEnergyOutput > 0 ? (annualCost / annualEnergyOutput) / 1000 : 0;

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
      pdf.save("results_solar.pdf");
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
              Energy Results
            </h3>
          </div>
          <div className="px-6 py-4">
            
            {/* Annual Energy */}
            <div className="mb-3">
              <span className="text-base font-medium text-gray-600">
                Annual Energy Output:
              </span>
              <span className="block font-semibold text-lg text-gray-800">
                {annualEnergyOutput.toLocaleString(undefined, { 
                        maximumFractionDigits: 0 
                      })} MWh/yr
              </span>
            </div>

            {/* Capacity Factor */}
            <div className="mb-3">
              <span className="text-base font-medium text-gray-600">
                Capacity Factor:
              </span>
              <span className="block font-semibold text-lg text-gray-800">
                {capacity_factor_solar || 0}%
              </span>
            </div>

            {/* LCOE */}
            <div className="mb-3">
              <span className="text-base font-medium text-gray-600">
                LCOE:
              </span>
              <span className="block font-semibold text-lg text-gray-800">
                ${lcoe?.toFixed(3) || "0.000"}/kWh
              </span>
            </div>
          </div>
        </div>

        {/* Cost Details */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden col-span-1">
          <div className="bg-gray-200 px-5 py-3">
            <h3 className="text-xl font-bold text-gray-800 text-center">
              Financial Results
            </h3>
          </div>
          <div className="px-6 py-4">

            {/* Initial Cost */}
            <div className="mb-3">
              <span className="text-base font-medium text-gray-600">
                Initial Cost:
              </span>
              <span className="block font-semibold text-lg text-gray-800">
                ${String(initial_cost).split('.')[0]}
              </span>
            </div>

            {/* Maintenance Cost */}
            <div className="mb-3">
              <span className="text-base font-medium text-gray-600">
                Annual Maintenance:
              </span>
              <span className="block font-semibold text-lg text-gray-800">
              ${String(main_cost).split('.')[0]}
              </span>
            </div>

            {/* Annual Revenue */}
            <div className="mb-3">
              <span className="text-base font-medium text-gray-600">
                Annual Revenue:
              </span>
              <span className="block font-semibold text-lg text-gray-800">
                ${annualRevenue.toLocaleString(undefined, { 
                        maximumFractionDigits: 0 
                      })}
              </span>
            </div>

            {/* Payback Period */}
            <div className="mb-3">
              <span className="text-base font-medium text-gray-600">
                Payback Period:
              </span>
              <span className="block font-semibold text-lg text-gray-800">
                {payback_period || 0} years
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

        {/* -------- Monthly Generation Plot from API -------- */}
        {solarPlotImage && (
          <>
            <h4 className="text-lg font-semibold mb-2">Monthly Electricity Generation</h4>
            <div className="mb-8">
              <img 
                src={solarPlotImage} 
                alt="Monthly Generation Plot" 
                className="w-full h-auto max-h-96 object-contain"
              />
            </div>
          </>
        )}

        {/* -------- Cash Flow Plot from API -------- */}
        {cashflowPlotImage && (
          <>
            <h4 className="text-lg font-semibold mb-2">Cash Flow</h4>
            <div className="mb-8">
              <img 
                src={cashflowPlotImage} 
                alt="Cash Flow Plot" 
                className="w-full h-auto max-h-96 object-contain"
              />
            </div>
          </>
        )}

        {/* -------- O&M Cost Plot from API -------- */}
        {omcostPlotImage && (
          <>
            <h4 className="text-lg font-semibold mb-2">O&M Cost</h4>
            <div className="mb-8">
              <img 
                src={omcostPlotImage} 
                alt="O&M Cost Plot" 
                className="w-full h-auto max-h-96 object-contain"
              />
            </div>
          </>
        )}

        {/* -------- Receipt Plot from API -------- */}
        {recieptPlotImage && (
          <>
            <h4 className="text-lg font-semibold mb-2">Energy Receipt</h4>
            <div className="mb-8">
              <img 
                src={recieptPlotImage} 
                alt="Receipt Plot" 
                className="w-full h-auto max-h-96 object-contain"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SolarResultsPage;
