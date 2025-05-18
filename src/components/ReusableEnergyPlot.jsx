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

// Memoize the ReusableEnergyPlot component
export const ReusableEnergyPlot = React.memo(
  ({
    chartTitle,
    xAxisTitle,
    yAxisTitle,
    labels,
    datasets,
    label,
    data,
    type = "bar",
    showLegend = false,
  }) => {
    const chartOptions = useMemo(
      () =>
        createEnergyChartOptions(
          chartTitle,
          xAxisTitle,
          yAxisTitle,
          showLegend
        ),
      [chartTitle, xAxisTitle, yAxisTitle, showLegend]
    );

    const chartData = useMemo(() => {
      if (datasets) {
        return createEnergyChartData(labels, datasets, type);
      } else {
        return createEnergyChartData(labels, { label, data }, type);
      }
    }, [datasets, labels, type, label, data]);

    return type === "line" ? (
      <Line data={chartData} options={chartOptions} />
    ) : (
      <Bar data={chartData} options={chartOptions} />
    );
  }
);

ReusableEnergyPlot.displayName = "ReusableEnergyPlot";
