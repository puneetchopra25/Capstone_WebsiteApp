export const createEnergyChartData = (
  labels,
  datasets,
  defaultType = "bar"
) => ({
  labels,
  datasets: Array.isArray(datasets)
    ? datasets.map(
        ({
          label,
          data,
          type = defaultType,
          color = "rgba(13, 126, 201, 0.7)",
        }) => ({
          type,
          label,
          data,
          backgroundColor:
            type === "line" ? color.replace("0.7", "0.2") : color,
          borderColor: color,
          borderWidth: 2,
          fill: type === "line",
          tension: 0.4,
        })
      )
    : [
        {
          type: defaultType,
          label: datasets.label,
          data: datasets.data,
          backgroundColor:
            defaultType === "line"
              ? "rgba(13, 126, 201, 0.2)"
              : "rgba(13, 126, 201, 0.7)",
          borderColor: "rgba(13, 126, 201, 0.7)",
          borderWidth: 2,
          fill: defaultType === "line",
          tension: 0.4,
        },
      ],
});

export const createEnergyChartOptions = (
  chartTitle,
  xAxisTitle,
  yAxisTitle,
  showLegend = false
) => ({
  responsive: true,
  plugins: {
    legend: {
      display: showLegend,
      position: "bottom",
      align: "center",
      labels: {
        usePointStyle: true,
        padding: 15,
        font: {
          size: 12,
        },
        boxWidth: 10,
      },
    },
    title: {
      display: true,
      text: chartTitle,
      font: {
        size: 20,
        weight: "bold",
      },
    },
  },
  scales: {
    x: {
      title: {
        display: true,
        text: xAxisTitle,
        font: {
          size: 14,
          weight: "bold",
        },
      },
    },
    y: {
      title: {
        display: true,
        text: yAxisTitle,
        font: {
          size: 14,
          weight: "bold",
        },
      },
    },
  },
  layout: {
    padding: {
      right: 10,
    },
  },
});
