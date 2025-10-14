import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import {
  CircularProgress,
  Typography,
  Chip,
  type ChipProps,
  Box,
} from "@mui/material";
import { useTheme } from "~/providers/theme-provider";
import { dataGridSxStyles, dataGridClassNames } from "~/lib/mui-theme";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Truck,
  Package,
  RefreshCw,
  CreditCard,
  type LucideIcon,
  Eye,
  EditIcon,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import OrderItemsDialog from "../components/order-items-dialog";
import { OrderStatusDialog } from "~/components/order-status-dialog";
import { Button } from "~/components/ui/button";

export enum OrderStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  DELIVERED = "DELIVERED",
  SHIPPED = "SHIPPED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

interface OrderItem {
  id: string;
  quantity: number;
  productId: string;
}

interface Payment {
  id: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  createdAt: string;
  status: OrderStatus;
  totalPrice: number;
  userId: string;
  items: OrderItem[];
  payment: Payment;
}

export const statusIcons: Record<OrderStatus, LucideIcon> = {
  [OrderStatus.PENDING]: Clock,
  [OrderStatus.PROCESSING]: RefreshCw,
  [OrderStatus.DELIVERED]: Package,
  [OrderStatus.SHIPPED]: Truck,
};

const statusColors: Record<OrderStatus, ChipProps["color"]> = {
  [OrderStatus.PENDING]: "warning",
  [OrderStatus.PROCESSING]: "info",
  [OrderStatus.DELIVERED]: "success",
  [OrderStatus.SHIPPED]: "secondary",
};

const paymentStatusColors: Record<PaymentStatus, ChipProps["color"]> = {
  [PaymentStatus.PENDING]: "warning",
  [PaymentStatus.COMPLETED]: "success",
  [PaymentStatus.FAILED]: "error",
};

const paymentStatusIcons: Record<PaymentStatus, LucideIcon> = {
  [PaymentStatus.PENDING]: CreditCard,
  [PaymentStatus.COMPLETED]: CheckCircle,
  [PaymentStatus.FAILED]: AlertCircle,
};

export function OrdersTable() {
  const queryClient = useQueryClient();
  const { isDarkMode } = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const {
    data: ordersData,
    isLoading,
    error,
  } = useQuery<Order[], Error>({
    queryKey: ["orders"],
    queryFn: async (): Promise<Order[]> => {
      const response = await fetch(
        "http://localhost:8000/v1/api/orders/admin?sort=-createdAt,id"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      return await response.json();
    },
  });

  const orders = ordersData || []; // This is all you need

  const handleOpenDialog = (order: Order) => {
    setSelectedOrder(order);
    setOpenDialog(true);
  };

  const columns: GridColDef<Order>[] = [
    {
      field: "id",
      headerName: "Order ID",
      width: 120,
      valueGetter: (value: string) =>
        `${value.slice(0, 5)}...${value.slice(-3)}`,
      sortable: false,
    },
    {
      field: "createdAt",
      headerName: "Date",
      headerAlign: "center",
      align: "center",
      width: 180,
      valueFormatter: ({ value }: { value: Date }) => {
        return new Intl.DateTimeFormat("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(value);
      },
    },
    {
      field: "items",
      headerName: "Products",
      width: 120,
      renderCell: (params) => {
        const itemCount = params.value.length;
        return (
          <div className="flex items-center gap-x-2">
            <span>{itemCount === 1 ? "Product" : "Products"}</span>
            <Eye
              onClick={() => handleOpenDialog(params.row)}
              className="cursor-pointer"
              size={13}
            />
          </div>
        );
      },
      sortable: false,
    },
    {
      field: "totalPrice",
      headerName: "Total",
      headerAlign: "center",
      align: "center",
      flex: 1,
      minWidth: 150,
      valueGetter: (value: number) => value / 100,
      valueFormatter: (value: number) =>
        new Intl.NumberFormat("en-KE", {
          style: "currency",
          currency: "KES",
          maximumFractionDigits: 0,
        }).format(value),
    },
    {
      field: "payment",
      headerName: "Payment",
      headerAlign: "center",
      align: "center",
      minWidth: 200,
      flex: 1,
      renderCell: (params) => {
        const payment = params.value as Payment;
        const Icon = paymentStatusIcons[payment.status];
        return (
          <Chip
            icon={<Icon size={16} />}
            label={payment.status}
            color={paymentStatusColors[payment.status]}
            size="small"
            sx={{
              "& .MuiChip-icon": {
                marginLeft: "4px",
                color: "inherit",
              },
            }}
          />
        );
      },
      sortable: false,
    },
    {
      field: "status",
      headerName: "Status",
      headerAlign: "center",
      align: "center",
      cellClassName: "ml-4",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => {
        const Icon = statusIcons[params.value as OrderStatus];
        return (
          <div className="w-44 h-full flex justify-between items-center">
            <Chip
              icon={<Icon size={16} />}
              label={params.value.replace("_", " ")}
              color={statusColors[params.value as OrderStatus]}
              size="small"
              sx={{
                "& .MuiChip-icon": {
                  marginLeft: "4px",
                  color: "inherit",
                },
              }}
            />
            <OrderStatusDialog
              order={params.row}
              onStatusUpdated={() => {
                queryClient.invalidateQueries({
                  queryKey: ["dashboard-data", "orders"],
                });
              }}
            >
              <Button
                variant={"ghost"}
                size={"icon"}
                className="h-8 w-8 p-0 hover:bg-transparent"
              >
                <EditIcon className="h-4 w-4" />
              </Button>
            </OrderStatusDialog>
          </div>
        );
      },
      sortable: false,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[100vh]">
        <CircularProgress
          style={{ color: isDarkMode ? "#ff6700" : "#ff7a20" }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[100vh]">
        <Typography color="error">Error loading orders</Typography>
      </div>
    );
  }

  if (!orders.length) {
    return <Typography>No orders found</Typography>;
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h5" gutterBottom>
        Orders
      </Typography>
      <DataGrid
        rows={orders}
        columns={columns}
        pageSizeOptions={[5, 10, 25]}
        className={dataGridClassNames}
        sx={{
          ...dataGridSxStyles(isDarkMode),
          width: "100%",
          "& .MuiDataGrid-main": { width: "100%" },
          "& .MuiDataGrid-virtualScroller": { width: "100%" },
          "& .MuiDataGrid-overlay": {
            backgroundColor: "var(--background)",
            color: "var(--primary)",
          },
          "& .MuiDataGrid-actionsCell": {
            gap: "8px",
          },
          "& .MuiDataGrid-scrollbar": {
            zIndex: 10,
          },
        }}
        disableColumnMenu
        disableRowSelectionOnClick
        getRowId={(row) => row.id}
      />
      {selectedOrder && (
        <OrderItemsDialog
          open={openDialog}
          onOpenChange={setOpenDialog}
          order={selectedOrder}
        />
      )}
    </Box>
  );
}

export default OrdersTable;
