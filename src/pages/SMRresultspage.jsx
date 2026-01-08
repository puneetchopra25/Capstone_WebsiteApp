import { useEffect, useState, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { FileText } from "lucide-react";

const monthLabels = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec"
];

const SMRResultsPage = ({ SMRCalcValues, SMRInputValues }) => {
  const [smrData, setSmrData] = useState(null);
  const [error, setError] = useState(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (SMRCalcValues) {
      try {
        const preliminary = SMRCalcValues.preliminary_results;
        setSmrData({
          model_name: SMRInputValues?.modelName || preliminary.model_name,
          num_units: SMRInputValues?.numUnits || preliminary.num_units,
          annual_energy_output: preliminary.estimated_annual_generation_mwh,
          annual_cost: preliminary.estimated_annual_om_cost_usd,
          lcoe: SMRInputValues?.kwhCost || 0,
          monthly_generation: Array(12).fill(preliminary.estimated_annual_generation_mwh / 12),
          monthly_cost: Array(12).fill(preliminary.estimated_annual_om_cost_usd / 12),
        });
      } catch (err) {
        console.error(err);
        setError("Failed to process SMR data.");
      }
    }
  }, [SMRCalcValues, SMRInputValues]);

  const downloadPDF = async () => {
    if (contentRef.current) {
      const canvas = await html2canvas(contentRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, width, height);
      pdf.save("SMR_results.pdf");
    }
  };

  if (!SMRCalcValues) return <div className="p-6 text-center">Click "Simulate" to see SMR results.</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;
  if (!smrData) return <div className="p-6 text-center">Loading SMR results...</div>;

  const { annual_energy_output, annual_cost, lcoe, monthly_generation, monthly_cost, model_name, num_units } = smrData;
  const maxGen = Math.max(...monthly_generation);
  const maxCost = Math.max(...monthly_cost);

  return (
    <div className="py-8 px-4 mx-auto max-w-7xl" style={{ maxHeight: "calc(113vh - 100px)", overflowY: "scroll" }}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md col-span-1">
          <div className="bg-gray-200 px-5 py-3">
            <h3 className="text-xl font-bold text-gray-800 text-center">Energy Results</h3>
          </div>
          <div className="px-6 py-4">
            <div className="mb-3">
              <span className="text-base font-medium text-gray-600">Annual Energy Output</span>
              <span className="block font-semibold text-lg text-gray-800">{annual_energy_output.toLocaleString()} MWh/yr</span>
            </div>
            <div className="mb-3">
              <span className="text-base font-medium text-gray-600">LCOE</span>
              <span className="block font-semibold text-lg text-gray-800">${Number(lcoe).toFixed(3)} / kWh</span>
            </div>
            <div className="mb-3">
              <span className="text-base font-medium text-gray-600">Number of SMR Units</span>
              <span className="block font-semibold text-lg text-gray-800">{num_units}</span>
            </div>
            <div className="mb-3">
              <span className="text-base font-medium text-gray-600">SMR Model</span>
              <span className="block font-semibold text-lg text-gray-800">{model_name}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md col-span-1">
          <div className="bg-gray-200 px-5 py-3">
            <h3 className="text-xl font-bold text-gray-800 text-center">Cost Results</h3>
          </div>
          <div className="px-6 py-4">
            <div className="mb-3">
              <span className="text-base font-medium text-gray-600">Annual Cost:</span>
              <span className="block font-semibold text-lg text-gray-800">${annual_cost.toLocaleString()}</span>
            </div>
            <div className="mb-3">
              <span className="text-base font-medium text-gray-600">Avg. Monthly Cost:</span>
              <span className="block font-semibold text-lg text-gray-800">
                ${(annual_cost / 12).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
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

        <div ref={contentRef}
          className="bg-white rounded-lg shadow-md p-4 flex flex-col"
          style={{ minHeight: "400px" }}
>
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
    </div>
  );
};

export default SMRResultsPage;
