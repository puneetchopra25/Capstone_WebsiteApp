import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRef } from "react";
import { FileText } from "lucide-react";
const Windresultspage = ({
  calculatedValues,
  weibullPlotImage,
  powerCurvePlotImage,
  monthly_wind_energy,
  range_plot_wind,
}) => {
  const contentRef = useRef(null); // Create a ref

  const downloadPDF = async () => {
    if (contentRef.current) {
      const contentWidth = contentRef.current.scrollWidth;
      const contentHeight = contentRef.current.scrollHeight;
      const canvas = await html2canvas(contentRef.current, {
        scale: 2, // Adjusting scale might improve quality
        width: contentWidth,
        height: contentHeight,
        useCORS: true,
      });

      // Get the aspect ratio of the content
      const contentAspectRatio = contentWidth / contentHeight;

      // Create a PDF that matches the width and height of the content
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = pdfWidth / contentAspectRatio;

      const pdf = new jsPDF({
        orientation: contentAspectRatio > 1 ? "landscape" : "portrait",
        unit: "mm",
        format: [pdfWidth, pdfHeight],
      });

      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("results_wind.pdf");
    }
  };
  // const downloadPDF = async () => {
  //   if (contentRef.current) {
  //     // Scroll to the top of the content to capture everything
  //     contentRef.current.scrollTop = 0;

  //     // Give the UI a moment to settle before taking the screenshot
  //     await new Promise(resolve => setTimeout(resolve, 100));

  //     const canvas = await html2canvas(contentRef.current, {
  //       scale: 3, // Adjusting scale might improve quality
  //       useCORS: true,
  //       scrollY: -window.scrollY, // Adjust scroll position
  //       scrollX: 0,
  //       windowHeight: contentRef.current.scrollHeight,
  //       windowWidth: contentRef.current.scrollWidth,
  //     });

  //     // Get the aspect ratio of the content
  //     const contentWidth = canvas.width;
  //     const contentHeight = canvas.height;
  //     const contentAspectRatio = contentWidth / contentHeight;

  //     // Create a PDF that matches the width and height of the canvas
  //     const pdfWidth = 210; // A4 width in mm
  //     const pdfHeight = pdfWidth / contentAspectRatio;

  //     const pdf = new jsPDF({
  //       orientation: contentAspectRatio > 1 ? 'landscape' : 'portrait',
  //       unit: 'mm',
  //       format: [pdfWidth, pdfHeight],
  //     });

  //     const imgData = canvas.toDataURL('image/png');
  //     pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  //     pdf.save('results.pdf');
  //   }
  // };

  return (
    calculatedValues &&
    weibullPlotImage &&
    powerCurvePlotImage &&
    monthly_wind_energy &&
    range_plot_wind && (
      <div
        className="py-8 px-4 mx-auto max-w-7xl"
        style={{ maxHeight: "calc(113vh - 100px)", overflowY: "scroll" }}
      >
        {/* Top section with Calculation Results, Cost Details and Download PDF button */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {" "}
          {/* Grid layout for medium devices and up */}
          {/* Calculation Results */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden col-span-1">
            <div className="bg-gray-200 px-5 py-3">
              <h3 className="text-xl font-bold text-gray-800 text-center">
                Energy Results
              </h3>
            </div>
            <div className="px-6 py-4">
              {/* Replace the following spans with your calculated values */}

              {/* Expexted Energy Range */}
              <div className="mb-3">
                <span className="text-base font-medium text-gray-600">
                  Expected Energy Range:
                </span>
                <span className="block font-semibold text-lg text-gray-800">
                  {calculatedValues.Energy_Range}
                </span>
              </div>

              {/* Annual Energy for the selected year */}
              <div className="mb-3">
                <span className="text-base font-medium text-gray-600">
                  Annual Energy for the selected year:
                </span>
                <span className="block font-semibold text-lg text-gray-800">
                  {calculatedValues.annual_energy} kWh
                </span>
              </div>

              {/* Capacity Factor */}
              <div className="mb-3">
                <span className="text-base font-medium text-gray-600">
                  Capacity Factor:
                </span>
                <span className="block font-semibold text-lg text-gray-800">
                  {calculatedValues.capacity_factor} %
                </span>
              </div>

              {/*  Effective Area */}
              <div>
                <span className="text-base font-medium text-gray-600">
                  Effective Area:
                </span>
                <span className="block font-semibold text-lg text-gray-800">
                  {calculatedValues.effective_area} sq.m
                </span>
              </div>
            </div>
          </div>
          {/* Cost Details */}
          <div className="bg-gray rounded-lg  overflow-hidden col-span-1"></div>
          {/* Empty div for alignment */}
          <div className="col-span-1">
            {/* Wrapper div for the button to align it to the right */}
            <div className="flex justify-end">
              {/* Download PDF button */}
              <button
                onClick={downloadPDF}
                className="flex items py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl transition duration-300 ease-in-out text-base shadow-lg"
              >
                Download PDF
                <FileText className="ml-2 w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Graphical Analysis Section */}
        <div
          ref={contentRef}
          className="bg-white rounded-lg shadow-md overflow-hidden p-4 flex flex-col justify-between"
          style={{ height: "100%" }}
        >
          <h3 className="text-3xl font-bold text-gray-800 mb-4 text-center ml-11">
            Graphical Analysis
          </h3>
          {monthly_wind_energy && (
            <img
              src={monthly_wind_energy}
              alt="Power Curve"
              className="max-w-full h-auto"
            />
          )}
          {powerCurvePlotImage && (
            <img
              src={powerCurvePlotImage}
              alt="Power Curve"
              className="max-w-full h-auto"
            />
          )}
          {range_plot_wind && (
            <img
              src={range_plot_wind}
              alt="Power Curve"
              className="max-w-full h-auto"
            />
          )}
          {weibullPlotImage && (
            <img
              src={weibullPlotImage}
              alt="Weibull Distribution Plot"
              className="max-w-full h-auto mb-4"
            />
          )}
        </div>
      </div>
    )
  );
};

export default Windresultspage;
