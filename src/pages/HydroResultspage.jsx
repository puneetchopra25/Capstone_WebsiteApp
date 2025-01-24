import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRef } from "react";
import { FileText } from "lucide-react";
import placeholderEnergy from "../assets/placeholder_energy.png";
import { useEffect, useState } from "react";
import { ReusableEnergyPlot } from "../components/CommonComponents";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
  Image,
} from "@react-pdf/renderer";

// Define PDF document styles
const documentStyles = StyleSheet.create({
  section: { margin: 10 },
  table: { width: "100%", borderWidth: 1, borderColor: "#000" },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#000" },
  tableCell: { flex: 1, fontSize: 12, padding: 5, textAlign: "left" },
  page: { padding: 30, fontSize: 12, lineHeight: 1.5 },
  header: {
    fontSize: 22,
    marginBottom: 25,
    textAlign: "center",
    fontWeight: "900",
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 15,
    marginTop: 10,
    textAlign: "center",
    fontWeight: "bold",
    color: "black",
  },
  graph: { marginBottom: 20, width: "100%", height: "auto" },
});

const HydroResultsPage = ({ hydroCalcValues, hydroInputValues }) => {
  const contentRef = useRef(null); // Create a ref for the content
  const hydroPlotRef = useRef(null); // Create a ref for the monthly energy chart
  const [hydroPlotImage, sethydroPlotImage] = useState(null);
  const [isDocumentReady, setIsDocumentReady] = useState(false);

  useEffect(() => {
    // Capture the chart after a delay to ensure it is fully rendered
    const captureChart = async () => {
      if (hydroPlotRef.current) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const canvas = await html2canvas(hydroPlotRef.current, {
          useCORS: true,
          scale: 3,
        });
        const image = canvas.toDataURL("image/png");
        sethydroPlotImage(image);
      }
    };

    captureChart();
    setIsDocumentReady(true); // Indicate the document is ready
  }, []);

  // old downloadPDF function
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

  // Function to convert energy values to appropriate units (value is initially in MWh)
  function formatEnergyValue(value) {
    if (value >= 1e3) {
      // Use GWh
      return `${(value / 1e3).toFixed(3)} GWh`; // Convert to Gigawatt-hours
    } else if (value >= 1) {
      // Use MWh
      return `${value.toFixed(3)} MWh`; // Keep in Megawatt-hours
    } else if (value >= 0.001) {
      // Use kWh
      return `${(value * 1e3).toFixed(3)} kWh`; // Convert to Kilowatt-hours
    } else {
      // Use Wh
      return `${(value * 1e6).toFixed(3)} Wh`; // Convert to Watt-hours
    }
  }

  // Calculate annual hydro energy
  const annualHydroEnergy = hydroCalcValues.monthly_energy.reduce(
    (acc, curr) => acc + curr,
    0
  );

  // Calculate average monthly energy
  const averageMonthlyEnergy = annualHydroEnergy / 12;

  // Format annual and average monthly energy values
  const formattedAnnualHydroEnergy = formatEnergyValue(annualHydroEnergy);
  const formattedAverageMonthlyEnergy = formatEnergyValue(averageMonthlyEnergy);

  // Function to format monthly energy data for the bar plot
  function formatEnergyBarPlotUnits(data) {
    const maxValue = Math.max(...data); // Get the maximum value in the data
    if (maxValue >= 1e3) {
      // Use GWh
      return {
        formattedData: data.map((value) => value / 1e3), // Convert MWh to GWh
        unit: "GWh",
      };
    } else if (maxValue >= 1) {
      // Use MWh
      return {
        formattedData: data, // Keep as MWh
        unit: "MWh",
      };
    } else if (maxValue >= 0.001) {
      // Use kWh
      return {
        formattedData: data.map((value) => value * 1e3), // Convert MWh to kWh
        unit: "kWh",
      };
    } else {
      // Use Wh
      return {
        formattedData: data.map((value) => value * 1e6), // Convert MWh to Wh
        unit: "Wh",
      };
    }
  }

  // Format data for the bar plot
  const { formattedData, unit } = formatEnergyBarPlotUnits(
    hydroCalcValues.monthly_energy
  );

  // testing
  // console.log(`Annual Hydro Energy: ${formattedAnnualHydroEnergy}`);
  // console.log("Average Monthly Hydro Energy:", formattedAverageMonthlyEnergy);
  // console.log("Annual Energy:", annualHydroEnergy);
  // console.log("Hydro Calc Values:", hydroCalcValues);
  // console.log("hydro head", hydroCalcValues.hydro_head);
  // console.log("Hydro Input Values:", hydroInputValues);

  // Create a PDF document
  const MyDocument = ({ hydroPlotImage }) => (
    <Document>
      {/* Page 1 */}
      <Page size="A4" style={documentStyles.page}>
        <Text style={documentStyles.header}>
          Hydro Energy and Cost Analysis Report
        </Text>

        <View style={documentStyles.section}>
          <Text style={documentStyles.subtitle}>Input Parameters</Text>
          <View style={documentStyles.table}>
            {/* Power House Coordinates */}
            <View style={documentStyles.tableRow}>
              <Text style={documentStyles.tableCell}>
                Power House Coordinates
              </Text>
              <Text style={documentStyles.tableCell}>
                Longitude: {hydroInputValues.powerHouseCoordinates.lng},
                Latitude: {hydroInputValues.powerHouseCoordinates.lat}
              </Text>
            </View>
            {/* Intake Coordinates */}
            <View style={documentStyles.tableRow}>
              <Text style={documentStyles.tableCell}>Intake Coordinates</Text>
              <Text style={documentStyles.tableCell}>
                Longitude: {hydroInputValues.intakeCoordinates.lng}, Latitude:{" "}
                {hydroInputValues.intakeCoordinates.lat}
              </Text>
            </View>
            {/* Turbine Model */}
            <View style={documentStyles.tableRow}>
              <Text style={documentStyles.tableCell}>Turbine Model</Text>
              <Text style={documentStyles.tableCell}>
                {hydroInputValues.turbine}
              </Text>
            </View>
            {/* Density */}
            <View style={documentStyles.tableRow}>
              <Text style={documentStyles.tableCell}>Density</Text>
              <Text style={documentStyles.tableCell}>
                {hydroInputValues.density} kg/m³
              </Text>
            </View>
            {/* Gravity */}
            <View style={documentStyles.tableRow}>
              <Text style={documentStyles.tableCell}>Gravity</Text>
              <Text style={documentStyles.tableCell}>
                {hydroInputValues.gravity} m/s²
              </Text>
            </View>
            {/* Analysis Period */}
            <View style={documentStyles.tableRow}>
              <Text style={documentStyles.tableCell}>Analysis Period</Text>
              <Text style={documentStyles.tableCell}>
                {hydroInputValues.analysisPeriod} years
              </Text>
            </View>
            {/* Interest Rate */}
            <View style={documentStyles.tableRow}>
              <Text style={documentStyles.tableCell}>Interest Rate</Text>
              <Text style={documentStyles.tableCell}>
                {hydroInputValues.interestRate} %
              </Text>
            </View>
            {/* Price of Energy */}
            <View style={documentStyles.tableRow}>
              <Text style={documentStyles.tableCell}>Price of Energy</Text>
              <Text style={documentStyles.tableCell}>
                {hydroInputValues.priceOfEnergy} $/kWh
              </Text>
            </View>
          </View>
        </View>

        {/* Energy Results */}
        <View style={documentStyles.section}>
          <Text style={documentStyles.subtitle}>Energy Results</Text>
          <View style={documentStyles.table}>
            {/* Annual AC Energy */}
            <View style={documentStyles.tableRow}>
              <Text style={documentStyles.tableCell}>Annual AC Energy</Text>
              <Text style={documentStyles.tableCell}>
                {formattedAnnualHydroEnergy}
              </Text>
            </View>
            {/* Average Monthly AC Energy */}
            <View style={documentStyles.tableRow}>
              <Text style={documentStyles.tableCell}>
                Average Monthly AC Energy
              </Text>
              <Text style={documentStyles.tableCell}>
                {formattedAverageMonthlyEnergy}
              </Text>
            </View>
            {/* Head */}
            <View style={documentStyles.tableRow}>
              <Text style={documentStyles.tableCell}>Head</Text>
              <Text style={documentStyles.tableCell}>
                {hydroCalcValues.hydro_head.toFixed(3)} m
              </Text>
            </View>
            {/* Efficiency */}
            <View style={documentStyles.tableRow}>
              <Text style={documentStyles.tableCell}>Efficiency</Text>
              <Text style={documentStyles.tableCell}>
                {hydroCalcValues.efficiency} %
              </Text>
            </View>
          </View>
        </View>

        {/* Cost Results */}
        <View style={documentStyles.section}>
          <Text style={documentStyles.subtitle}>Cost Results</Text>
          <View style={documentStyles.table}>
            {/* Net Capital Cost */}
            <View style={documentStyles.tableRow}>
              <Text style={documentStyles.tableCell}>Net Capital Cost</Text>
              <Text style={documentStyles.tableCell}>$100</Text>
            </View>
            {/* Maintenance Cost */}
            <View style={documentStyles.tableRow}>
              <Text style={documentStyles.tableCell}>Maintenance Cost</Text>
              <Text style={documentStyles.tableCell}>$100/year</Text>
            </View>
            {/* Generation Revenue */}
            <View style={documentStyles.tableRow}>
              <Text style={documentStyles.tableCell}>Generation Revenue</Text>
              <Text style={documentStyles.tableCell}>$100/year</Text>
            </View>
            {/* Payback Period */}
            <View style={documentStyles.tableRow}>
              <Text style={documentStyles.tableCell}>Payback Period</Text>
              <Text style={documentStyles.tableCell}>10 years</Text>
            </View>
          </View>
        </View>
      </Page>

      {/* Page 2 - Graphs */}
      <Page size="A4" style={documentStyles.page}>
        <Text style={documentStyles.subtitle}>Graphical Analysis</Text>
        {hydroPlotImage ? (
          <Image style={documentStyles.graph} src={hydroPlotImage} />
        ) : (
          <Text>Graph not available</Text>
        )}
        {hydroCalcValues && (
          <Image
            src={placeholderEnergy}
            alt="Power Curve"
            className="max-w-full h-auto"
          />
        )}
      </Page>
    </Document>
  );

  return (
    hydroCalcValues && (
      <div
        className="py-8 px-4 mx-auto max-w-7xl"
        style={{ maxHeight: "calc(113vh - 100px)", overflowY: "scroll" }}
      >
        {/* Top section with Calculation Results, Cost Results and Download PDF button */}

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
              <div className="mb-3">
                <span className="text-base font-medium text-gray-600">
                  Annual AC Energy:
                </span>
                <span className="block font-semibold text-lg text-gray-800">
                  {formattedAnnualHydroEnergy}
                </span>
              </div>

              {/* Average Monthly AC Energy */}
              <div className="mb-3">
                <span className="text-base font-medium text-gray-600">
                  Average Monthly AC Energy:
                </span>
                <span className="block font-semibold text-lg text-gray-800">
                  {formattedAverageMonthlyEnergy}
                </span>
              </div>

              {/* Hydro Head ---- placeholder*/}
              <div className="mb-3">
                <span className="text-base font-medium text-gray-600">
                  Head:
                </span>
                <span className="block font-semibold text-lg text-gray-800">
                  {hydroCalcValues.hydro_head.toFixed(3)} m
                </span>
              </div>

              {/* Efficiency ----- for now placeholder */}
              <div className="mb-3">
                <span className="text-base font-medium text-gray-600">
                  Efficiency:
                </span>
                <span className="block font-semibold text-lg text-gray-800">
                  {hydroCalcValues.efficiency} %
                </span>
              </div>
            </div>
          </div>
          {/* Cost Results */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden col-span-1">
            <div className="bg-gray-200 px-5 py-3">
              <h3 className="text-xl font-bold text-gray-800 text-center">
                Cost Results
              </h3>
            </div>
            <div className="px-6 py-4">
              {/* Replace the following spans with your cost results */}
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
          {/* <div className="col-span-1 flex justify-end items-start"> */}
          {/* Download PDF button */}
          {/* <button
              onClick={downloadPDF}
              className="flex items-center py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl transition duration-300 ease-in-out text-base shadow-lg"
            >
              Download PDF
              <FileText className="ml-2 w-5 h-5" />
            </button>
          </div>
           */}
          <div className="col-span-1 flex justify-end items-start">
            {isDocumentReady && (
              <div className="flex items-center py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl transition duration-300 ease-in-out text-base shadow-lg">
                <PDFDownloadLink
                  document={<MyDocument hydroPlotImage={hydroPlotImage} />}
                  fileName="results_HydroEnergy.pdf"
                  className="flex items-center"
                >
                  Download PDF
                  <FileText className="ml-2 w-5 h-5" />
                </PDFDownloadLink>
              </div>
            )}
          </div>
        </div>

        {/* Graphical Analysis Section ---- for now using placeholder energy image for src */}
        <div
          ref={contentRef}
          className="bg-white rounded-lg shadow-md overflow-hidden p-4 flex flex-col justify-between"
          style={{ height: "100%" }}
        >
          <h3 className="text-3xl font-bold text-gray-800 mb-4 text-center ml-11">
            Graphical Analysis
          </h3>
          {/* Monthly Energy Plot */}
          <div ref={hydroPlotRef}>
            <div className="mb-4">
              <ReusableEnergyPlot
                chartTitle="Monthly AC Energy"
                xAxisTitle="Month"
                yAxisTitle={`Energy (${unit})`}
                labels={[
                  "Jan",
                  "Feb",
                  "Mar",
                  "Apr",
                  "May",
                  "Jun",
                  "Jul",
                  "Aug",
                  "Sep",
                  "Oct",
                  "Nov",
                  "Dec",
                ]}
                label={`Energy (${unit})`}
                data={formattedData}
                type="bar"
              />
            </div>

            {/*Monthly Flow Rate Plot */}
            <div className="mb-4">
              <ReusableEnergyPlot
                chartTitle="Monthly Flow Rates"
                xAxisTitle="Months"
                yAxisTitle="Flow Rate (m³/s)"
                labels={[
                  "Jan",
                  "Feb",
                  "Mar",
                  "Apr",
                  "May",
                  "Jun",
                  "Jul",
                  "Aug",
                  "Sep",
                  "Oct",
                  "Nov",
                  "Dec",
                ]}
                label="Flow Rate (m³/s)"
                data={hydroCalcValues.flow_rate}
                type="line"
              />
            </div>
          </div>

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
