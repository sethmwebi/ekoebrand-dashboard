import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type ChartOptions,
  type ChartData,
} from "chart.js";

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

interface ProductRevenue {
  id: string;
  name: string;
  totalRevenue: number;
  color: string;
}

interface DonutRevenueChartProps {
  data: ProductRevenue[];
  title?: string;
  currencySymbol?: string;
  cutoutPercentage?: number;
  showLegend?: boolean;
  darkMode?: boolean;
}

export default function SummaryDoughnutChart({
  data,
  title = "Top Products by Revenue",
  currencySymbol = "KES",
  cutoutPercentage = 70,
  showLegend = true,
  darkMode,
}: DonutRevenueChartProps) {
  const textColor = darkMode ? "#fff" : "#000";

  // Prepare chart data with proper typing
  const chartData: ChartData<"doughnut"> = {
    labels: data.map((item) => item.name),
    datasets: [
      {
        data: data.map((item) => item.totalRevenue),
        backgroundColor: data.map((item) => item.color),
        borderColor: darkMode ? "#1d1f21" : "#fff",
        borderWidth: 2,
        hoverOffset: 10,
      },
    ],
  };

  // Chart options with proper typing
  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    color: textColor,
    maintainAspectRatio: false,
    cutout: `${cutoutPercentage}%`,
    plugins: {
      legend: {
        display: showLegend,
        position: "right",
        labels: {
          color: textColor,
          padding: 20,
          boxWidth: 16,
          font: {
            size: 12,
          },
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels?.length && data.datasets.length) {
              return data.labels.map((label, i) => ({
                text: `${label}`,
                // @ts-ignore
                fillStyle: data.datasets[0].backgroundColor?.[i],
                borderRadius: 2,
                hidden: false,
                fontColor: textColor,
                index: i,
              }));
            }
            return [];
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw as number;
            const total = context.dataset.data.reduce(
              (a: number, b: number) => a + b,
              0
            );
            const percentage = Math.round((value / total) * 100);
            return [
              `${currencySymbol} ${value.toLocaleString()} (${percentage}%)`,
            ];
          },
        },
        backgroundColor: darkMode ? "#1d1f21" : "#ffffff",
        titleColor: textColor,
        bodyColor: textColor,
        padding: 8,
        borderColor: darkMode ? "#374151" : "#e5e7eb",
        borderWidth: 1,
      },
    },
  };

  return (
    <div className="bg-background h-full px-2 rounded-lg">
      <h2 className="text-center pt-2" style={{ color: textColor }}>
        {title}
      </h2>
      <div className="h-[80%] mt-6">
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
}
