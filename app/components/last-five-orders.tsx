import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { CircularProgress, Typography } from "@mui/material";
import { dataGridSxStyles, dataGridClassNames } from "~/lib/mui-theme";
import { useTheme } from "~/providers/theme-provider";

interface ProductWithStats {
  id: string;
  name: string;
  price?: number;
  stock: number;
  images: string[];
  orderDate: string; // Changed from Date to string
  quantityOrdered: number;
  categoryName: string;
  timesOrdered: number;
}

interface LastFiveOrdersProps {
  productsWithStats: ProductWithStats[];
  isLoading?: boolean;
  error?: Error | null;
}

export function LastFiveOrders({
  productsWithStats,
  isLoading = false,
  error = null,
}: LastFiveOrdersProps) {
  const { isDarkMode } = useTheme();

  // Convert string dates to Date objects before passing to DataGrid
  const rows = productsWithStats.map((product) => ({
    ...product,
    orderDate: new Date(product.orderDate), // Convert string to Date
  }));

  const columns: GridColDef[] = [
    {
      field: "images",
      headerName: "Image",
      width: 100,
      renderCell: (params) => (
        <img
          src={params.value[0]}
          alt="Product"
          style={{ width: 50, height: 50, objectFit: "cover" }}
        />
      ),
    },
    { field: "name", headerName: "Product Name", flex: 1, minWidth: 120 },
    { field: "categoryName", headerName: "Category", flex: 1, minWidth: 120 },
    {
      field: "price",
      headerName: "Unit Price",
      width: 120,
      valueGetter: (value) => value / 100,
      valueFormatter: (value: number) => {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "KES",
          maximumFractionDigits: 0,
        }).format(value);
      },
    },
    {
      field: "orderDate",
      headerName: "Date Ordered",
      flex: 1,
      minWidth: 150,
      valueFormatter: ({ value }: { value: Date }) => {
        return new Intl.DateTimeFormat("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(value);
      },
    },
    { field: "stock", headerName: "Stock Remaining", width: 150 },
    { field: "timesOrdered", headerName: "Orders", width: 150 },
  ];

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress
          style={{ color: isDarkMode ? "#ff6700" : "#ff7a20" }}
        />
      </div>
    );
  if (error) return <Typography color="error">Error loading orders</Typography>;
  if (!productsWithStats.length)
    return <Typography>No orders found</Typography>;

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Typography mt={8} variant="h6" gutterBottom>
        Last Five Ordered Products
      </Typography>
      <div style={{ display: "flex" }}>
        <DataGrid
          rows={rows} // Use the converted rows
          columns={columns}
          pageSizeOptions={[5, 10, 20]}
          checkboxSelection={false}
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
          }}
          disableColumnSorting
          disableColumnMenu
          disableRowSelectionOnClick
          getRowId={(row) => row.id}
        />
      </div>
    </div>
  );
}
