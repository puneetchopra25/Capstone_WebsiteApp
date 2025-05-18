import html2canvas from "html2canvas";
import { useRef } from "react";
import { FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { ReusableEnergyPlot } from "../components/ReusableEnergyPlot";
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
  const financialPlotsRef = useRef(null); // Ref for all financial plots
  const costPlotRef = useRef(null); // Ref for cost plot

  const [financialPlotsImage, setFinancialPlotsImage] = useState(null);
  const [costPlotImage, setCostPlotImage] = useState(null);
  const [isDocumentReady, setIsDocumentReady] = useState(false);

  // Site information - This would come from your API or props in a real implementation
  const siteInfo = {
    site_link: hydroCalcValues.site_link,
    site_no: hydroCalcValues.site_no,
  };

  // console.log({ hydroCalcValues: hydroCalcValues });

  useEffect(() => {
    // Capture charts after a delay to ensure they are fully rendered
    const captureCharts = async () => {
      // Wait for charts to render
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Capture all financial plots together
      if (financialPlotsRef.current) {
        const canvas = await html2canvas(financialPlotsRef.current, {
          useCORS: true,
          scale: 3,
        });
        setFinancialPlotsImage(canvas.toDataURL("image/png"));
      }

      // Capture cost plot
      if (costPlotRef.current) {
        const canvas = await html2canvas(costPlotRef.current, {
          useCORS: true,
          scale: 3,
        });
        setCostPlotImage(canvas.toDataURL("image/png"));
      }

      // Set document as ready when all charts are captured
      setIsDocumentReady(true);
    };

    captureCharts();
  }, []);

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

  // Function to format capacity value
  function formatCapacityValue(value) {
    if (value >= 1e3) {
      // Use GWh
      return `${(value / 1e3).toFixed(3)} GW`; // Convert to Gigawatt
    } else if (value >= 1) {
      // Use MWh
      return `${value.toFixed(3)} MW`; // Keep in Megawatt
    } else if (value >= 0.001) {
      // Use kWh
      return `${(value * 1e3).toFixed(3)} kW`; // Convert to Kilowatt
    } else {
      // Use Wh
      return `${(value * 1e6).toFixed(3)} W`; // Convert to Watt
    }
  }

  // Function to format cost value to have commas as thousand separators
  function formatCostValue(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  // Annual Energy
  const annual_energy_mwh = hydroCalcValues.annual_energy_mwh;

  // Average Monthly Energy
  const averageMonthlyEnergy = annual_energy_mwh / 12;

  // Capacity
  const capacity_mw = hydroCalcValues.capacity_mw;

  // Format values
  const formattedAnnualHydroEnergy = formatEnergyValue(annual_energy_mwh);
  const formattedAverageMonthlyEnergy = formatEnergyValue(averageMonthlyEnergy);
  const formattedCapacity = formatCapacityValue(capacity_mw);
  const formattedAnnualCost = formatCostValue(hydroCalcValues.annual_cost);
  const formattedLifetimeCost = formatCostValue(hydroCalcValues.lifetime_cost);
  const formattedTotalInvestment = formatCostValue(
    hydroCalcValues.total_investment
  );

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
    hydroCalcValues.monthly_energy_mwh
  );

  // Function to format NPV cost data for the cost plot
  function formatCostPlotUnits(data) {
    const maxValue = Math.max(...data); // Get the maximum value in the data
    if (maxValue >= 1e9) {
      // Use billions
      return {
        formattedData: data.map((value) => value / 1e9),
        unit: "B $",
      };
    } else if (maxValue >= 1e6) {
      // Use millions
      return {
        formattedData: data.map((value) => value / 1e6),
        unit: "M $",
      };
    } else if (maxValue >= 1e3) {
      // Use thousands
      return {
        formattedData: data.map((value) => value / 1e3),
        unit: "T $",
      };
    } else {
      // Use dollars
      return {
        formattedData: data,
        unit: "$",
      };
    }
  }

  // Format data for the cost plot
  const { formattedData: formattedCostData, unit: NPVcostUnit } =
    formatCostPlotUnits(hydroCalcValues.annual_npv_cost);

  // Create a PDF document
  const MyDocument = () => (
    <Document>
      {/* Page 1 */}
      <Page size="A4" style={documentStyles.page}>
        <Text style={documentStyles.header}>
          Hydro Energy and Cost Analysis Report
        </Text>

        {/* Input Parameters */}
        <View style={documentStyles.section}>
          <Text style={documentStyles.subtitle}>Input Parameters</Text>
          <View style={documentStyles.table}>
            {/* Power House Coordinates */}
            <View style={documentStyles.tableRow}>
              <Text style={documentStyles.tableCell}>
                Power House Coordinates
              </Text>
              <Text style={documentStyles.tableCell}>
                Longitude:{" "}
                {hydroInputValues.powerHouseCoordinates.lng.toFixed(2)},
                Latitude:{" "}
                {hydroInputValues.powerHouseCoordinates.lat.toFixed(2)}
              </Text>
            </View>
            {/* Intake Coordinates */}
            <View style={documentStyles.tableRow}>
              <Text style={documentStyles.tableCell}>Intake Coordinates</Text>
              <Text style={documentStyles.tableCell}>
                Longitude: {hydroInputValues.intakeCoordinates.lng.toFixed(2)},
                Latitude: {hydroInputValues.intakeCoordinates.lat.toFixed(2)}
              </Text>
            </View>
            {/* Turbine Model */}
            <View style={documentStyles.tableRow}>
              <Text style={documentStyles.tableCell}>Turbine Model</Text>
              <Text style={documentStyles.tableCell}>
                {hydroInputValues.turbine}
              </Text>
            </View>
            {/* Penstock Diameter */}
            <View style={documentStyles.tableRow}>
              <Text style={documentStyles.tableCell}>Penstock Diameter</Text>
              <Text style={documentStyles.tableCell}>
                {hydroInputValues.penstockDiameter} m
              </Text>
            </View>
            {/* Penstock Velocity */}
            <View style={documentStyles.tableRow}>
              <Text style={documentStyles.tableCell}>Penstock Velocity</Text>
              <Text style={documentStyles.tableCell}>
                {hydroInputValues.penstockVelocity} m/s
              </Text>
            </View>
            {/* Head Loss */}
            <View style={documentStyles.tableRow}>
              <Text style={documentStyles.tableCell}>Head Loss</Text>
              <Text style={documentStyles.tableCell}>
                {hydroInputValues.headLoss} %
              </Text>
            </View>
            {/* Eco Flow */}
            <View style={documentStyles.tableRow}>
              <Text style={documentStyles.tableCell}>Eco Flow</Text>
              <Text style={documentStyles.tableCell}>
                {hydroInputValues.ecoFlow} %
              </Text>
            </View>
            {/* Analysis Period */}
            <View style={documentStyles.tableRow}>
              <Text style={documentStyles.tableCell}>Analysis Period</Text>
              <Text style={documentStyles.tableCell}>
                {hydroInputValues.analysisPeriod} years
              </Text>
            </View>
            {/* Discount Rate */}
            <View style={documentStyles.tableRow}>
              <Text style={documentStyles.tableCell}>Discount Rate</Text>
              <Text style={documentStyles.tableCell}>
                {hydroInputValues.discountRate} %
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
              <Text style={documentStyles.tableCell}>Annual Energy</Text>
              <Text style={documentStyles.tableCell}>
                {formattedAnnualHydroEnergy}
              </Text>
            </View>
            {/* Average Monthly AC Energy */}
            <View style={documentStyles.tableRow}>
              <Text style={documentStyles.tableCell}>
                Average Monthly Energy
              </Text>
              <Text style={documentStyles.tableCell}>
                {formattedAverageMonthlyEnergy}
              </Text>
            </View>
            {/* Capacity */}
            <View style={documentStyles.tableRow}>
              <Text style={documentStyles.tableCell}>Capacity</Text>
              <Text style={documentStyles.tableCell}>{formattedCapacity}</Text>
            </View>
            {/* Head */}
            <View style={documentStyles.tableRow}>
              <Text style={documentStyles.tableCell}>Head</Text>
              <Text style={documentStyles.tableCell}>
                {Math.round(hydroCalcValues.hydro_head)} m
              </Text>
            </View>
            {/* Efficiency */}
            {/* <View style={documentStyles.tableRow}>
              <Text style={documentStyles.tableCell}>Efficiency</Text>
              <Text style={documentStyles.tableCell}>
                {hydroCalcValues.efficiency} %
              </Text>
            </View> */}
          </View>
        </View>

        {/* Cost Results */}
        <View style={documentStyles.section}>
          <Text style={documentStyles.subtitle}>Cost Results</Text>
          <View style={documentStyles.table}>
            {/* Total Annual Cost */}
            <View style={documentStyles.tableRow}>
              <Text style={documentStyles.tableCell}>Total Annual Cost</Text>
              <Text style={documentStyles.tableCell}>
                $ {formattedAnnualCost}
              </Text>
            </View>
            {/* Total Lifetime Cost */}
            <View style={documentStyles.tableRow}>
              <Text style={documentStyles.tableCell}>Total Lifetime Cost</Text>
              <Text style={documentStyles.tableCell}>
                $ {formattedLifetimeCost}
              </Text>
            </View>
            {/* Total Investment */}
            <View style={documentStyles.tableRow}>
              <Text style={documentStyles.tableCell}>Total Investment</Text>
              <Text style={documentStyles.tableCell}>
                $ {formattedTotalInvestment}
              </Text>
            </View>
            {/* Levelized Cost of Energy */}
            <View style={documentStyles.tableRow}>
              <Text style={documentStyles.tableCell}>
                Levelized Cost of Energy
              </Text>
              <Text style={documentStyles.tableCell}>
                $ {hydroCalcValues.levelized_cost} ($/kWh)
              </Text>
            </View>
          </View>
        </View>
      </Page>

      {/* Page 2 - Financial Plots (Monthly Energy, River Flow Rate, Intake Flow Rate) */}
      <Page size="A4" style={documentStyles.page}>
        <Text style={documentStyles.subtitle}>
          Graphical Analysis
        </Text>

        {financialPlotsImage ? (
          <Image style={documentStyles.graph} src={financialPlotsImage} />
        ) : (
          <Text style={{ textAlign: "center" }}>
            Financial plots not available
          </Text>
        )}
      </Page>

      {/* Page 3 - Cost Plot (Annual NPV Cost) */}
      <Page size="A4" style={documentStyles.page}>
        <Text style={documentStyles.subtitle}>Graphical Cost Analysis</Text>

        {costPlotImage ? (
          <Image style={documentStyles.graph} src={costPlotImage} />
        ) : (
          <Text style={{ textAlign: "center" }}>Cost plot not available</Text>
        )}
      </Page>
    </Document>
  );

  // Generate year labels for the annual NPV cost plot based on the analysis period
  function generateYearLabels(analysisYears) {
    return Array.from({ length: analysisYears }, (_, i) => `Year ${i + 1}`);
  }

  return (
    hydroCalcValues && (
      <div
        className="py-8 px-4 mx-auto max-w-7xl"
        style={{ maxHeight: "calc(113vh - 100px)", overflowY: "scroll" }}
      >
        {/* PDF Download button in top right corner */}
        <div className="flex justify-end mb-4">
          <div
            className={`flex items-center py-2 px-4 ${
              isDocumentReady
                ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                : "bg-gray-400 cursor-not-allowed pointer-events-none"
            } text-white rounded-3xl transition duration-300 ease-in-out text-base shadow-lg`}
          >
            {isDocumentReady ? (
              <PDFDownloadLink
                document={<MyDocument />}
                fileName="results_HydroEnergy.pdf"
                className="flex items-center"
              >
                Download PDF
                <FileText className="ml-2 w-5 h-5" />
              </PDFDownloadLink>
            ) : (
              <span className="flex items-center">
                Download PDF
                <FileText className="ml-2 w-5 h-5" />
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {" "}
          {/* Calculation Results */}
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
                  Annual Energy:
                </span>
                <span className="block font-semibold text-lg text-gray-800">
                  {formattedAnnualHydroEnergy}
                </span>
              </div>

              {/* Average Monthly Energy */}
              <div className="mb-3">
                <span className="text-base font-medium text-gray-600">
                  Average Monthly Energy:
                </span>
                <span className="block font-semibold text-lg text-gray-800">
                  {formattedAverageMonthlyEnergy}
                </span>
              </div>

              {/* Capacity*/}
              <div className="mb-3">
                <span className="text-base font-medium text-gray-600">
                  Capacity:
                </span>
                <span className="block font-semibold text-lg text-gray-800">
                  {formattedCapacity}
                </span>
              </div>

              {/* Hydro Head*/}
              <div className="mb-3">
                <span className="text-base font-medium text-gray-600">
                  Head:
                </span>
                <span className="block font-semibold text-lg text-gray-800">
                  {Math.round(hydroCalcValues.hydro_head)} m
                </span>
              </div>

              {/* Efficiency */}
              {/* <div className="mb-3">
                <span className="text-base font-medium text-gray-600">
                  Efficiency:
                </span>
                <span className="block font-semibold text-lg text-gray-800">
                  {hydroCalcValues.efficiency} %
                </span>
              </div> */}
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
              {/* Total Annual Cost */}
              <div className="mb-3">
                <span className="text-base font-medium text-gray-600">
                  Total Annual Cost:
                </span>
                <span className="block font-semibold text-lg text-gray-800">
                  $ {formattedAnnualCost}
                </span>
              </div>

              {/* Total Lifetime Cost */}
              <div className="mb-3">
                <span className="text-base font-medium text-gray-600">
                  Total Lifetime Cost:
                </span>
                <span className="block font-semibold text-lg text-gray-800">
                  $ {formattedLifetimeCost}
                </span>
              </div>

              {/* Total Investment*/}
              <div className="mb-3">
                <span className="text-base font-medium text-gray-600">
                  Total Investment:
                </span>
                <span className="block font-semibold text-lg text-gray-800">
                  $ {formattedTotalInvestment}
                </span>
              </div>

              {/* Levelized Cost of Energy */}
              <div className="mb-3">
                <span className="text-base font-medium text-gray-600">
                  Levelized Cost of Energy:
                </span>
                <span className="block font-semibold text-lg text-gray-800">
                  $ {hydroCalcValues.levelized_cost} ($/kWh)
                </span>
              </div>
            </div>
          </div>
          {/* Station Information */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden col-span-1 h-64">
            <div className="bg-gray-200 px-5 py-3">
              <h3 className="text-xl font-bold text-gray-800 text-center">
                Station Information
              </h3>
            </div>
            <div className="px-6 py-3">
              <div className="mb-2">
                <span className="text-base font-medium text-gray-600">
                  Station Number:
                </span>
                <span className="block font-semibold text-lg text-gray-800">
                  {siteInfo.site_no}
                </span>
              </div>
              <div className="mb-1">
                <span className="text-base font-medium text-gray-600">
                  Station Source:
                </span>
                <a
                  href={siteInfo.site_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block font-semibold text-lg text-blue-600 hover:text-blue-800"
                >
                  Station Data
                </a>
              </div>
              {/* Add a note about the link for better context - reduced bottom spacing */}
              <div className="text-xs text-gray-500">
                Click the link above to view detailed station data.
              </div>
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

          {/* Financial Plots Section */}
          <div ref={financialPlotsRef}>
            {/* Monthly Energy Plot */}
            <div className="mb-4">
              <ReusableEnergyPlot
                chartTitle="Monthly Energy"
                xAxisTitle="Months"
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

            {/* Combined Flow Rates Plot */}
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
                datasets={[
                  {
                    label: "River Flow Rate",
                    data: hydroCalcValues.river_flowrate,
                    type: "line",
                    color: "rgba(0, 122, 209, 0.86)",
                  },
                  {
                    label: "Intake Flow Rate",
                    data: hydroCalcValues.intake_flowrate,
                    type: "line",
                    color: "rgba(58, 190, 41, 0.88)",
                  },
                ]}
                type="line"
                showLegend={true}
              />
            </div>
          </div>

          {/* Cost Plot Section */}
          <div ref={costPlotRef} className="mb-4">
            <ReusableEnergyPlot
              chartTitle="Annual NPV Cost"
              xAxisTitle="Years"
              yAxisTitle={`NPV Cost (${NPVcostUnit})`}
              labels={generateYearLabels(hydroInputValues.analysisPeriod)}
              label={`NPV Cost (${NPVcostUnit})`}
              data={formattedCostData}
              type="line"
            />
          </div>
        </div>
      </div>
    )
  );
};

export default HydroResultsPage;
