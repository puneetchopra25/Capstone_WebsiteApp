import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useRef } from 'react';

const SolarResultsPage = ({solarCalcValues}) => {
    const contentRef = useRef(null); // Create a ref

    const downloadPDF = async () => {
      if(contentRef.current) {
        const canvas = await html2canvas(contentRef.current); // Use the ref's current value
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF({
          orientation: "landscape",
        });
        
        // Adjust dimensions as needed
        pdf.addImage(imgData, 'PNG', 0, 0, 297, 210); // A4 size page of PDF in landscape
        pdf.save('solar-results.pdf');
      } 
    };

    return (
      solarCalcValues && (
        <div className="py-8 px-4 mx-auto max-w-7xl" style={{ maxHeight: 'calc(113vh - 100px)', overflowY: 'scroll' }}>
                  {/* Top section with Calculation Results, Cost Details and Download PDF button */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"> {/* Grid layout for medium devices and up */}
                    
                    {/* Calculation Results */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden col-span-1">
                      <div className="bg-gray-200 px-5 py-3">
                        <h3 className="text-lg font-semibold text-gray-800">Energy Results</h3>
                      </div>
                      <div className="px-6 py-4">
                        {/* Replace the following spans with your calculated values */}
                        <div className="mb-3">
                          <span className="text-sm font-medium text-gray-600">Annual Energy</span>
                          <span className="block font-semibold text-lg text-gray-800">{solarCalcValues.annual_energy_s} kWh</span>
                        </div>
                        <div className="mb-3">
                          <span className="text-sm font-medium text-gray-600">Capacity Factor:</span>
                          <span className="block font-semibold text-lg text-gray-800">{solarCalcValues.device_no} %</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Energy Range:</span>
                          <span className="block font-semibold text-lg text-gray-800">{solarCalcValues.tracking}</span>
                        </div>
                      </div>
                    </div>

                    {/* Cost Details */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden col-span-1">
                      <div className="bg-gray-200 px-5 py-3">
                        <h3 className="text-lg font-semibold text-gray-800">Cost Details</h3>
                      </div>
                      <div className="px-6 py-4">
                        {/* Replace the following spans with your cost details */}
                        <div className="mb-3">
                          <span className="text-sm font-medium text-gray-600">Total Cost:</span>
                          <span className="block font-semibold text-lg text-gray-800">$VALUE</span>
                        </div>
                        <div className="mb-3">
                          <span className="text-sm font-medium text-gray-600">Maintenance Rate:</span>
                          <span className="block font-semibold text-lg text-gray-800">$VALUE</span>
                        </div>
                        <div className="mb-3">
                          <span className="text-sm font-medium text-gray-600">Maintenance Cost:</span>
                          <span className="block font-semibold text-lg text-gray-800">$VALUE</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Incremental Cost:</span>
                          <span className="block font-semibold text-lg text-gray-800">$VALUE</span>
                        </div>
                      </div>
                    </div>

                    {/* Empty div for alignment */}
                    <div className="col-span-1 flex justify-end items-start">
                      {/* Download PDF button */}
                      <button onClick={downloadPDF} className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl transition duration-300 ease-in-out text-md shadow-lg">
                        Download PDF
                      </button>
                    </div>
                  </div>

                  {/* Graphical Analysis Section */}
                  <div className="bg-white rounded-lg shadow-md overflow-hidden p-4 flex flex-col justify-between" style={{ height: '100%' }}>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Graphical Analysis</h3>
                    
                  </div>
                </div>
      )
    );
};
  
export default SolarResultsPage;
