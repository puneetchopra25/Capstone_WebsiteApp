// Create new file for chart-related utilities
export const createEnergyChartData = (labels, label, data, type = "bar") => ({
  labels,
  datasets: [
    {
      type,
      label,
      data,
      backgroundColor:
        type === "bar" ? "rgba(13, 126, 201, 0.7)" : "rgba(13, 126, 201, 0.2)",
      borderColor: "rgba(13, 126, 201, 0.7)",
      borderWidth: 2,
      fill: type === "line",
      tension: 0.4,
    },
  ],
});

export const createEnergyChartOptions = (
  chartTitle,
  xAxisTitle,
  yAxisTitle
) => ({
  responsive: true,
  plugins: {
    title: {
      display: true,
      text: chartTitle,
      font: {
        size: 20,
        weight: "bold",
      },
    },
    legend: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: yAxisTitle,
        font: {
          size: 16,
          weight: "bold",
        },
      },
    },
    x: {
      title: {
        display: true,
        text: xAxisTitle,
        font: {
          size: 16,
          weight: "bold",
        },
      },
    },
  },
});
