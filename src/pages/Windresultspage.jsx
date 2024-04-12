import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useRef } from 'react';
const Windresultspage = ({calculatedValues, weibullPlotImage, powerCurvePlotImage, monthly_wind_energy, range_plot_wind}) => {
    const contentRef = useRef(null); // Create a ref

    // const downloadPDF = async () => {
    //   if (contentRef.current) {
    //     const contentWidth = contentRef.current.scrollWidth;
    //     const contentHeight = contentRef.current.scrollHeight;
    //     const canvas = await html2canvas(contentRef.current, {
    //       scale: 2, // Adjusting scale might improve quality
    //       width: contentWidth,
    //       height: contentHeight,
    //       useCORS: true
    //     });
    
    //     // Get the aspect ratio of the content
    //     const contentAspectRatio = contentWidth / contentHeight;
    
    //     // Create a PDF that matches the width and height of the content
    //     const pdfWidth = 210; // A4 width in mm
    //     const pdfHeight = pdfWidth / contentAspectRatio;
    
    //     const pdf = new jsPDF({
    //       orientation: contentAspectRatio > 1 ? 'landscape' : 'portrait',
    //       unit: 'mm',
    //       format: [pdfWidth, pdfHeight]
    //     });
    
    //     const imgData = canvas.toDataURL('image/png');
    //     pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    //     pdf.save('results.pdf');
    //   }
    // };
    const downloadPDF = async () => {
      if (contentRef.current) {
        // Assuming contentRef is attached to the parent container that includes everything you want to capture
        const canvas = await html2canvas(contentRef.current, {
          scale: window.devicePixelRatio, // Adjust scale based on device's pixel ratio
          logging: true, // Enable for debugging
          useCORS: true // To handle external image CORS policy
        });
    
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 295;  // A4 height in mm
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
    
        // Initialize document in portrait orientation
        const pdf = new jsPDF('p', 'mm');
        let position = 0;
    
        // Add pages while there is content to write
        while (heightLeft >= 0) {
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
          position -= pageHeight;
    
          // Avoid adding an empty page at the end
          if (heightLeft > 0) {
            pdf.addPage();
          }
        }
        
        pdf.save('complete-report.pdf');
      }
    };
    
    
    
    
    

    return (
      calculatedValues && weibullPlotImage && powerCurvePlotImage && monthly_wind_energy && range_plot_wind && (
        <div ref={contentRef} className="py-8 px-4 mx-auto max-w-7xl" style={{ maxHeight: 'calc(113vh - 100px)', overflowY: 'scroll' }}>
                  {/* Top section with Calculation Results, Cost Details and Download PDF button */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"> {/* Grid layout for medium devices and up */}
                    
                    {/* Calculation Results */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden col-span-1">
                      <div className="bg-gray-200 px-5 py-3">
                        <h3 className="text-lg font-semibold text-gray-800">Energy Results</h3>
                      </div>
                      <div className="px-6 py-4">
                        {/* Replace the following spans with your calculated values */}
                        <div className="mb-3" >
                          <span className="text-sm font-medium text-gray-600">Annual Energy:</span>
                          <span className="block font-semibold text-lg text-gray-800">{calculatedValues.annual_energy} kWh</span>
                        </div>
                        <div className="mb-3">
                          <span className="text-sm font-medium text-gray-600">Capacity Factor:</span>
                          <span className="block font-semibold text-lg text-gray-800">{calculatedValues.capacity_factor} %</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Energy Range:</span>
                          <span className="block font-semibold text-lg text-gray-800">{calculatedValues.Energy_Range}</span>
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
                          <span className="text-sm font-medium text-gray-600">Cost of Installation:</span>
                          <span className="block font-semibold text-lg text-gray-800">2,000,000$-4,000,000$</span>
                        </div>
                        <div className="mb-3">
                          <span className="text-sm font-medium text-gray-600">Maintenance Rate:</span>
                          <span className="block font-semibold text-lg text-gray-800">1000$/kWh</span>
                        </div>
                        <div className="mb-3">
                          <span className="text-sm font-medium text-gray-600">Maintenance Cost:</span>
                          <span className="block font-semibold text-lg text-gray-800">$42,000-$48,000/year</span>
                        </div>
                        {/* <div>
                          <span className="text-sm font-medium text-gray-600">Incremental Cost:</span>
                          <span className="block font-semibold text-lg text-gray-800">$VALUE</span>
                        </div> */}
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
                    {weibullPlotImage && <img src={weibullPlotImage} alt="Weibull Distribution Plot" className="max-w-full h-auto mb-4" />}
                    {powerCurvePlotImage && <img src={powerCurvePlotImage} alt="Power Curve" className="max-w-full h-auto" />}
                    {monthly_wind_energy && <img src={monthly_wind_energy} alt="Power Curve" className="max-w-full h-auto" />}
                    {range_plot_wind && <img src={range_plot_wind} alt="Power Curve" className="max-w-full h-auto" />}
                  </div>
                </div>
      )
    );
  };
  
  export default Windresultspage;