import { Check, Cpu, Layers, RefreshCcw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import SummaryBarChart from "~/components/summary-bar-chart";
import SummaryDoughnutChart from "~/components/summary-doughnut-chart";
import { LastFiveOrders } from "~/components/last-five-orders";
import { useTheme } from "~/providers/theme-provider";
import SummaryCards from "~/components/summary-cards";
import { CircularProgress } from "@mui/material";
import { getAuth } from "~/helpers/fetcher";

interface ProcessedProductRevenue {
  id: string;
  name: string;
  price: number;
  totalRevenue: number;
}

interface ChartProduct extends ProcessedProductRevenue {
  color: string;
}

export interface DashboardData {
  totalOrders: number;
  processingOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  topRevenueProducts: ProcessedProductRevenue[];
  categoriesRevenue: { category: string; revenue: number }[];
  productsWithStats: {
    id: string;
    name: string;
    price: number;
    stock: number;
    images: string[];
    orderDate: string;
    quantityOrdered: number;
    categoryName: string;
    timesOrdered: number;
  }[];
}

export async function clientLoader() {}

export default function Dashboard() {
  const { isDarkMode } = useTheme();

  const { data, isLoading, error } = useQuery<DashboardData, Error>({
    queryKey: ["dashboard-data"],
    queryFn: async () => {
      const auth = getAuth();
      const accessToken = auth?.accessToken;

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/v1/api/dashboard`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            errorData.error ||
            "Failed to fetch dashboard data"
        );
      }

      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress
          style={{ color: isDarkMode ? "#ff6700" : "#ff7a20" }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">Error: {error.message}</p>
      </div>
    );
  }

  const chartData: ChartProduct[] =
    data?.topRevenueProducts?.map((product, index) => ({
      ...product,
      color: ["#10B981", "#3B82F6", "#F59E0B", "#8B5CF6"][index % 4],
    })) || [];

  return (
    <div className="my-4 px-6 sm:px-4">
      <div className="grid grid-cols-1 my-4 place-items-center sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        <SummaryCards
          className="hidden sm:block"
          Icon={Layers}
          subtitle="Total orders"
          value={data?.totalOrders || 0}
        />
        <SummaryCards
          Icon={Cpu}
          subtitle="Processing orders"
          value={data?.processingOrders || 0}
        />
        <SummaryCards
          Icon={RefreshCcw}
          className="hidden sm:block"
          subtitle="Pending orders"
          value={data?.pendingOrders || 0}
        />
        <SummaryCards
          Icon={Check}
          subtitle="Delivered orders"
          value={data?.deliveredOrders || 0}
        />
      </div>

      <div className="md:h-[60vh] w-full flex flex-col lg:flex-row gap-4 mb-4">
        <div className="flex-1 md:h-full">
          <SummaryBarChart
            data={data?.categoriesRevenue || []}
            title="Revenue by Category"
            height="400px"
            barColor="#4f46e5"
            currencySymbol="KES"
            darkMode={isDarkMode}
            showLegend={true}
          />
        </div>
        <div className="flex-1">
          <SummaryDoughnutChart
            currencySymbol="KES"
            data={chartData}
            darkMode={isDarkMode}
          />
        </div>
      </div>

      <div className="w-full mt-8">
        <LastFiveOrders productsWithStats={data?.productsWithStats || []} />
      </div>
    </div>
  );
}
