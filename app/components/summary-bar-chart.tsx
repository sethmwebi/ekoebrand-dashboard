import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
  type ChartData,
} from "chart.js";
import { useScreenSize } from "~/lib/screen";
import { thousandFormatter } from "~/lib/utils";
import { useEffect } from "react";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface CategoryRevenueData {
  category: string;
  revenue: number;
}

interface CategoryRevenueChartProps {
  data: CategoryRevenueData[];
  title?: string;
  height?: number | string;
  width?: number | string;
  barColor?: string;
  currencySymbol?: string;
  showLegend?: boolean;
  darkMode?: boolean;
}

export default function SummaryBarChart({
  data,
  title = "Revenue by Category",
  height = "100%",
  width = "100%",
  barColor = "#8884d8",
  currencySymbol = "Ksh",
  showLegend = true,
  darkMode,
}: CategoryRevenueChartProps) {
  const { width: screenWidth } = useScreenSize();
  // const textColor = "#4B0082";
  const textColor = darkMode ? "#fff" : "#000";

  const chartData: ChartData<"bar"> = {
    labels: data.map((item) => item.category),
    datasets: [
      {
        label: `Revenue (${currencySymbol})`,
        data: data.map((item) => item.revenue),
        backgroundColor: barColor,
        borderColor: darkMode ? "#374151" : "#e5e7eb",
        borderWidth: 0,
        borderRadius: 4,
        hoverBackgroundColor: `${barColor}${darkMode ? "cc" : "99"}`,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    color: textColor,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: "top",
        labels: {
          color: textColor,
          boxWidth: 12,
          padding: 20,
        },
      },
      title: {
        display: !!title,
        text: title,
        color: textColor,
        font: {
          size: 16,
          weight: 500,
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: darkMode ? "#1d1f21" : "#fff",
        titleColor: textColor,
        bodyColor: textColor,
        borderColor: darkMode ? "#374151" : "#e5e7eb",
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context) => {
            const value = context.raw as number;
            return screenWidth < 768
              ? thousandFormatter(value)
              : `${currencySymbol} ${value.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          color: textColor,
          autoSkip: false,
          maxRotation: 45,
          minRotation: 45,
          padding: 10,
        },
      },
      y: {
        grid: {
          color: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          color: textColor,
          callback: (value) => {
            if (typeof value === "number") {
              if (value === 0) return null;
              return screenWidth < 768
                ? thousandFormatter(value)
                : `${value.toLocaleString()}`;
            }
            return value;
          },
          padding: 5,
        },
      },
    },
  };

  return (
    <div
      style={{ width, height }}
      className="relative bg-background rounded-lg px-4"
    >
      <Bar data={chartData} options={options} redraw={true} />
    </div>
  );
}
