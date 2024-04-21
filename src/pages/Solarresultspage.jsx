import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useRef } from 'react';

const SolarResultsPage = ({solarCalcValues, systemCapacityOrArea, solarPlotImage, cashflowPlotImage, omcostPlotImage, recieptPlotImage}) => {
  const contentRef = useRef(null); // Create a ref

  const downloadPDF = async () => {
    if (contentRef.current) {
      const contentWidth = contentRef.current.scrollWidth;
      const contentHeight = contentRef.current.scrollHeight;
      const canvas = await html2canvas(contentRef.current, {
        scale: 2, // Adjusting scale might improve quality
        width: contentWidth,
        height: contentHeight,
        useCORS: true
      });
  
      // Get the aspect ratio of the content
      const contentAspectRatio = contentWidth / contentHeight;
  
      // Create a PDF that matches the width and height of the content
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = pdfWidth / contentAspectRatio;
  
      const pdf = new jsPDF({
        orientation: contentAspectRatio > 1 ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
      });
  
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('results_solar.pdf');
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
                        <h3 className="text-xl font-bold text-gray-800">Energy Results</h3>
                      </div>
                      <div className="px-6 py-4">
                        {/* Replace the following spans with your calculated values */}
                        <div className="mb-3">
                          <span className="text-md font-medium text-gray-600">Annual AC Energy</span>
                          <span className="block font-semibold text-lg text-gray-800">{solarCalcValues.annual_energy_s} kWh</span>
                        </div>
                        <div className="mb-3">
                          <span className="text-md font-medium text-gray-600">Capacity Factor</span>
                          <span className="block font-semibold text-lg text-gray-800">{solarCalcValues.capacity_factor_solar} %</span>
                        </div>
                        <div className="mb-3">
                          <span className="text-md font-medium text-gray-600">Number of Cells</span>
                          <span className="block font-semibold text-lg text-gray-800">{solarCalcValues.device_no}</span>
                        </div>
                        <div className="mb-3">
                          <span className="text-md font-medium text-gray-600">Total Module Area</span>
                          <span className="block font-semibold text-lg text-gray-800">{solarCalcValues.total_module_area} sq. m</span>
                        </div>
                        {/* <div>
                          <span className="text-sm font-medium text-gray-600">Required Area:</span>
                          <span className="block font-semibold text-lg text-gray-800">{solarCalcValues.device_no}</span>
                        </div> */}
                        <div>
                        {
                          systemCapacityOrArea ? (
                            <div>
                              <span className="text-md font-medium text-gray-600">System Capacity</span>
                              <span className="block font-semibold text-lg text-gray-800">
                                {solarCalcValues.system_capacity} kW
                              </span>
                            </div>
                            
                          ) : (
                            
                            <div>
                              <span className="text-md font-medium text-gray-600">Required Area</span>
                              <span className="block font-semibold text-lg text-gray-800">
                                {solarCalcValues.required_area} sq. m
                              </span>
                            </div>
                          )
                        }
                        </div>
                      </div>
                    </div>

                    {/* Cost Details */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden col-span-1">
                      <div className="bg-gray-200 px-5 py-3">
                        <h3 className="text-xl font-bold text-gray-800">Cost Details</h3>
                      </div>
                      <div className="px-6 py-4">
                        {/* Replace the following spans with your cost details */}
                        <div className="mb-3">
                          <span className="text-md font-medium text-gray-600">Net Capital Cost:</span>
                          <span className="block font-semibold text-lg text-gray-800">$ {solarCalcValues.initial_cost}</span>
                        </div>
                        
                        <div className="mb-3">
                          <span className="text-md font-medium text-gray-600">Maintenance Cost:</span>
                          <span className="block font-semibold text-lg text-gray-800">$ {solarCalcValues.main_cost} / year</span>
                        </div>
                        <div className="mb-3">
                          <span className="text-md font-medium text-gray-600">Generation Revenue:</span>
                          <span className="block font-semibold text-lg text-gray-800">$ {solarCalcValues.gen_Rev} / year</span>
                        </div>
                        <div>
                          <span className="text-md font-medium text-gray-600">Payback Period:</span>
                          <span className="block font-semibold text-lg text-gray-800">{solarCalcValues.payback_period} years</span>
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
                  <div ref={contentRef} className="bg-white rounded-lg shadow-md overflow-hidden p-4 flex flex-col justify-between" style={{ height: '100%' }}>
                    <h3 className="text-3xl font-bold text-gray-800 mb-4 text-center ml-12">Graphical Analysis</h3>
                    {solarPlotImage && <img src={solarPlotImage} alt="Monthly Energy Plot" className="max-w-full h-auto mb-4" />}
                    {/* {cashflowPlotImage && <img src={cashflowPlotImage} alt="Cashflow Plot" className="max-w-full h-auto mb-4" />}
                    {omcostPlotImage && <img src={omcostPlotImage} alt="Monthly Energy Plot" className="max-w-full h-auto mb-4" />}
                    {recieptPlotImage && <img src={recieptPlotImage} alt="Monthly Energy Plot" className="max-w-full h-auto mb-4" />} */}
                    {cashflowPlotImage && cashflowPlotImage !== 'NA' && (
                      <img src={cashflowPlotImage} alt="Cashflow Plot" className="max-w-full h-auto mb-4" />
                    )}
                    {omcostPlotImage && omcostPlotImage !== 'NA' && (
                      <img src={omcostPlotImage} alt="OM Cost Plot" className="max-w-full h-auto mb-4" />
                    )}
                    {recieptPlotImage && recieptPlotImage !== 'NA' && (
                      <img src={recieptPlotImage} alt="Receipt Plot" className="max-w-full h-auto mb-4" />
                    )}
                  </div>
                </div>
      )
    );
};
  
export default SolarResultsPage;
