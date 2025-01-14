import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRef } from "react";
import { FileText } from "lucide-react";
import placeholderEnergy from "../assets/placeholder_energy.png";

const HydroResultsPage = ({ hydroCalcValues }) => {
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
      pdf.save("results_hydroEnergy.pdf");
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
    hydroCalcValues && (
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

              {/* Annual AC Energy */}
              {/* Only takes the first one ------ change later */}
              <div className="mb-3">
                <span className="text-base font-medium text-gray-600">
                  Annual AC Energy:
                </span>
                <span className="block font-semibold text-lg text-gray-800">
                  {hydroCalcValues[0].toFixed(3)} kWh
                </span>
              </div>

              {/* Average Monthly AC Energy */}
              {/* Only takes the first one ------ change later */}
              <div className="mb-3">
                <span className="text-base font-medium text-gray-600">
                  Average Monthly AC Energy:
                </span>
                <span className="block font-semibold text-lg text-gray-800">
                  {(hydroCalcValues[0] / 12).toFixed(3)} kWh
                </span>
              </div>

              {/* Capacity Factor ---- placeholder*/}
              <div className="mb-3">
                <span className="text-base font-medium text-gray-600">
                  Capacity Factor:
                </span>
                <span className="block font-semibold text-lg text-gray-800">
                  {10} %
                </span>
              </div>

              {/* Hydro Head Value ---- placeholder
              <div className="mb-3">
                <span className="text-base font-medium text-gray-600">
                  Head:
                </span>
                <span className="block font-semibold text-lg text-gray-800">
                  100 m
                </span>
              </div> */}

              {/* Efficiency ----- for now placeholder */}
              <div className="mb-3">
                <span className="text-base font-medium text-gray-600">
                  Efficiency:
                </span>
                <span className="block font-semibold text-lg text-gray-800">
                  90 %
                </span>
              </div>

              {/*  Effective Area */}
              {/* 
              <div>
                <span className="text-base font-medium text-gray-600">
                  Effective Area:
                </span>
                <span className="block font-semibold text-lg text-gray-800">
                  {calculatedValues.effective_area} sq.m
                </span>
              </div>
              */}
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
              {/* Replace the following spans with your cost details */}
              {/* Net Capital Cost */}
              <div className="mb-3">
                <span className="text-base font-medium text-gray-600">
                  Net Capital Cost:
                </span>
                <span className="block font-semibold text-lg text-gray-800">
                  $ 100
                </span>
              </div>

              {/* Maintenance Cost */}
              <div className="mb-3">
                <span className="text-base font-medium text-gray-600">
                  Maintenance Cost:
                </span>
                <span className="block font-semibold text-lg text-gray-800">
                  $ {100} / year
                </span>
              </div>

              {/* Generation Revenue */}
              <div className="mb-3">
                <span className="text-base font-medium text-gray-600">
                  Generation Revenue:
                </span>
                <span className="block font-semibold text-lg text-gray-800">
                  $ {100} / year
                </span>
              </div>

              {/* Payback Period */}
              <div>
                <span className="text-base font-medium text-gray-600">
                  Payback Period:
                </span>
                <span className="block font-semibold text-lg text-gray-800">
                  {10} years
                </span>
              </div>
            </div>
          </div>
          <div className="col-span-1 flex justify-end items-start">
            {/* Download PDF button */}
            <button
              onClick={downloadPDF}
              className="flex items-center py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl transition duration-300 ease-in-out text-base shadow-lg"
            >
              Download PDF
              <FileText className="ml-2 w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Graphical Analysis Section ---- fpr now using placeholder energy image for src */}
        <div
          ref={contentRef}
          className="bg-white rounded-lg shadow-md overflow-hidden p-4 flex flex-col justify-between"
          style={{ height: "100%" }}
        >
          <h3 className="text-3xl font-bold text-gray-800 mb-4 text-center ml-11">
            Graphical Analysis
          </h3>
          {hydroCalcValues && (
            <img
              src={placeholderEnergy}
              alt="Power Curve"
              className="max-w-full h-auto"
            />
          )}
          {hydroCalcValues && (
            <img
              src={placeholderEnergy}
              alt="Power Curve"
              className="max-w-full h-auto"
            />
          )}
          {hydroCalcValues && (
            <img
              src={placeholderEnergy}
              alt="Power Curve"
              className="max-w-full h-auto"
            />
          )}
          {hydroCalcValues && (
            <img
              src={placeholderEnergy}
              alt="Weibull Distribution Plot"
              className="max-w-full h-auto mb-4"
            />
          )}
        </div>
      </div>
    )
  );
};

export default HydroResultsPage;
