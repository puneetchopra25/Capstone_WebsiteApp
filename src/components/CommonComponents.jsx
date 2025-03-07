import { Switch } from "@headlessui/react";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
} from "chart.js";
import {
  createEnergyChartData,
  createEnergyChartOptions,
} from "../utils/chartUtils";
import React, { useMemo } from "react";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

// Creates a horizontal line as a section divider
export const SectionDivider = () => (
  <div className="my-6 border-t-2 border-gray-700"></div>
);

// Creates a section title with a shadow and background color
export const SectionTitle = ({ title }) => (
  <h2 className="text-xl font-semibold mb-4 shadow-sm p-3 rounded bg-gray-300 text-black">
    {title}
  </h2> // Shadow and background color for segmentation
);

// Creates a display with a label and value
export const DisplayWithLabel = ({ label, value }) => (
  <div className="flex items-center space-x-3 mb-4">
    {" "}
    {/* Add some margin-bottom for spacing */}
    <label className="block text-sm font-medium w-1/3">{label}</label>
    <span className="w-2/3 h-1/15 p-2 bg-gray-100 rounded-3xl flex items-center justify-center text-black">
      {value}
    </span>{" "}
    {/* Changed to bg-gray-100 for a distinct look */}
  </div>
);

// Creates a label with a message
export const LabelWithMessage = ({ label, message }) => (
  <div className="flex flex-col space-y-3">
    <div className="flex items-center space-x-3">
      <label className="block text-sm font-medium w-5/6">{label}</label>
    </div>
    <p className="text-sm text-gray-500 mt-1">{message}</p>
  </div>
);
// Creates an input with a label and value
export const InputWithLabel = ({
  label,
  id,
  value,
  onChange,
  step,
  error,
  min,
  max,
}) => (
  <div className="flex flex-col">
    <div className="flex items-center space-x-3">
      <label htmlFor={id} className="block text-sm font-medium w-1/3">
        {label}
      </label>
      <input
        type="number"
        id={id}
        value={value}
        step={step}
        min={min}
        max={max}
        onChange={onChange}
        className="mt-1 block w-full max-w-[65%] h-15 p-2 border border-gray-700 rounded-3xl text-center"
      />
    </div>
    {error && <p className="text-xs text-red-500 mt-1 ml-[35%]">{error}</p>}
  </div>
);

export const RangeInputWithLabel = ({
  label,
  id,
  value,
  onChange,
  min,
  max,
}) => {
  return (
    <div className="flex items-center space-x-3">
      <label htmlFor={id} className="block text-sm font-medium w-5/6">
        {label}
      </label>
      <input
        type="range"
        id={id}
        min={min}
        max={max}
        value={value}
        onChange={onChange}
        className="mt-1 block w-full max-w-[60%] h-2 bg-gray-700 rounded-full cursor-pointer"
      />
      <span className="ml-3 text-sm font-medium">{value}</span>
    </div>
  );
};

export const Popup = ({ message, onClose }) => {
  return (
    // <div className="fixed top-[180px] right-12 w-42  bg-white font-bold p-3 rounded-lg shadow-lg flex justify-center items-cente">
    <div className="fixed top-[230px] right-[92px] flex justify-center items-center">
      <div className="bg-white font-bold p-3 rounded-2xl shadow-lg">
        <p className="mb-2">{message}</p>
        <button
          onClick={onClose}
          className="py-1 px-4 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-lg transition duration-200 mx-auto block"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export const LoadingSpinnerMessage = ({ energy }) => {
  return (
    <div
      className="fixed top-1/2 left-0 right-[140px] z-50"
      style={{ transform: "translateY(-50%)" }}
    >
      <div className="flex flex-col items-center justify-center">
        {/* Spinner */}
        <div
          className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-blue-600"
          style={{ borderTopColor: "transparent" }}
        ></div>
        {/* Informative Message */}
        <p className="mt-4 text-lg font-medium text-gray-700 text-center">
          Running {energy || "the"} simulation, this may take a moment. Please
          wait for the results...
        </p>
      </div>
    </div>
  );
};

// export const LoadingPlotSpinner = () => {
//   return (
//     <div className="flex flex-col justify-center items-center p-12 space-y-4">
//       <div className="relative">
//         {/* Outer ring */}
//         <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
//         {/* Inner spinning ring */}
//         <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
//       </div>
//       {/* Loading text */}
//       <div className="text-center">
//         <p className="text-gray-700 font-medium">Loading graphs</p>
//         <p className="text-sm text-gray-500">
//           Please wait while we generate the plots
//         </p>
//       </div>
//     </div>
//   );
// };

// Memoize the ReusableEnergyPlot component
export const ReusableEnergyPlot = React.memo(
  ({
    chartTitle,
    xAxisTitle,
    yAxisTitle,
    labels,
    label,
    data,
    type = "bar",
  }) => {
    const chartOptions = useMemo(
      () => createEnergyChartOptions(chartTitle, xAxisTitle, yAxisTitle),
      [chartTitle, xAxisTitle, yAxisTitle]
    );

    const chartData = useMemo(
      () => createEnergyChartData(labels, label, data, type),
      [labels, label, data, type]
    );

    return type === "line" ? (
      <Line data={chartData} options={chartOptions} />
    ) : (
      <Bar data={chartData} options={chartOptions} />
    );
  }
);

ReusableEnergyPlot.displayName = "ReusableEnergyPlot";

// Turbine Selector Component
export const TurbineSelector = ({
  turbineModels,
  onSelectTurbine,
  selectedTurbineDetailsIndex,
}) => (
  <div className="flex items-center space-x-3 justify-center mb-4">
    <label
      htmlFor="turbine-selector"
      className="block text-sm font-medium w-1/3"
    >
      Select Turbine:
    </label>
    <select
      id="turbine-selector"
      onChange={onSelectTurbine}
      value={selectedTurbineDetailsIndex}
      className="mt-1 w-2/3 p-2 border border-gray-700 rounded-3xl text-center bg-blue-500 text-white"
    >
      {turbineModels.map((turbine) => (
        <option key={turbine.id} value={turbine.id}>
          {turbine.name}
        </option>
      ))}
    </select>
  </div>
);
