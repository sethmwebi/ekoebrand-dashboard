import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DataGrid,
  type GridColDef,
  type GridRowSelectionModel,
  type GridCallbackDetails,
} from "@mui/x-data-grid";
import { Box, Typography } from "@mui/material";
import axios from "axios";
import { dataGridSxStyles } from "~/lib/mui-theme";
import { useTheme } from "~/providers/theme-provider";
import { useState } from "react";
import { ProductCreateForm } from "~/components/product-create-form";
import { ProductEditForm } from "~/components/product-edit-form";
import type { Route } from "./+types/products";
import { EditIcon, Trash2Icon } from "lucide-react";
import { SingleProductDeleteForm } from "~/components/single-product-delete-form";
import { ProductDeleteForm } from "~/components/product-delete-form";

// Define interfaces
interface Tag {
  id: string;
  name: string;
  description: string;
}

interface ProductTag {
  productId: string;
  tagId: string;
  tag: Tag;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // In cents
  stock: number;
  images: string[];
  categoryId: string;
  category: { name: string };
  tags: ProductTag[];
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
}

interface QueryData {
  products: Product[];
  categories: Category[];
  tags: Tag[];
}

function truncateWithEllipsis(value: string, maxLength = 30) {
  if (typeof value !== "string") {
    value = String(value);
  }

  if (value.length <= maxLength) {
    return value;
  }

  // Find the last space before the maxLength
  const truncated = value.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  // If there's a space, cut at the last complete word; otherwise, hard cut
  const finalTruncated =
    lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated;

  return finalTruncated + "...";
}

export default function ProductsDashboard({}: Route.ComponentProps) {
  const { isDarkMode } = useTheme();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSingleDeleteDialogOpen, setIsSingleDeleteDialogOpen] =
    useState(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(
    null
  );

  // Fetch data
  const { data, isLoading, error } = useQuery<QueryData, Error>({
    queryKey: ["products", "categories", "tags"],
    queryFn: async () => {
      const [productsResponse, categoriesResponse, tagsResponse] =
        await Promise.all([
          axios.get<Product[]>(
            `${import.meta.env.VITE_BACKEND_URL}/v1/api/products`
          ),
          axios.get<Category[]>(
            `${import.meta.env.VITE_BACKEND_URL}/v1/api/categories`
          ),
          axios.get<Tag[]>(`${import.meta.env.VITE_BACKEND_URL}/v1/api/tags`),
        ]);

      const sortedProducts = [...productsResponse.data].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      return {
        products: sortedProducts,
        categories: categoriesResponse.data,
        tags: tagsResponse.data,
      };
    },
  });

  const queryClient = useQueryClient();
  // Delete mutation with optimistic updates
  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(
        ids.map((id) =>
          axios.delete(
            `${import.meta.env.VITE_BACKEND_URL}/v1/api/product/${id}`
          )
        )
      );
    },
    onMutate: async (ids) => {
      await queryClient.cancelQueries({
        queryKey: ["products", "categories", "tags"],
      });

      const previousData = queryClient.getQueryData<QueryData>([
        "products",
        "categories",
        "tags",
      ]);

      if (previousData) {
        queryClient.setQueryData<QueryData>(
          ["products", "categories", "tags"],
          {
            ...previousData,
            products: previousData.products.filter(
              (product) => !ids.includes(product.id)
            ),
          }
        );
      }

      return { previousData };
    },
    onError: (_, __, context) => {
      if (context?.previousData) {
        queryClient.setQueryData<QueryData>(
          ["products", "categories", "tags"],
          context.previousData
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["products", "categories", "tags"],
      });
    },
  });

  const { products = [], categories = [], tags = [] } = data || {};

  // Handle row selection
  const handleRowSelection = (
    rowSelectionModel: GridRowSelectionModel,
    _details: GridCallbackDetails<any>
  ) => {
    setSelectedRows(rowSelectionModel as string[]);
  };

  function handleEditClick(productId: string) {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setEditingProduct(product);
      setIsEditDialogOpen(true);
    }
  }

  function handleDeleteClick(productId: string) {
    setDeletingProductId(productId);
    setIsSingleDeleteDialogOpen(true);
  }

  // Define DataGrid columns
  const columns: GridColDef<Product>[] = [
    {
      field: "id",
      headerName: "ID",
      width: 100,
      valueGetter: (value: string) =>
        `${value.slice(0, 5)}...${value.slice(-3)}`,
      sortable: false,
    },
    { field: "name", headerName: "Name", flex: 1, minWidth: 200 },
    {
      field: "description",
      headerName: "Description",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <div
          dangerouslySetInnerHTML={{
            __html: truncateWithEllipsis(
              params.value.replace(/<[^>]*>?/gm, "")
            ),
          }}
        />
      ),
    },
    {
      field: "price",
      headerName: "Unit Price",
      width: 200,
      valueGetter: (value: number) => value / 100,
      valueFormatter: (value: number) =>
        new Intl.NumberFormat("en-KE", {
          style: "currency",
          currency: "KES",
          maximumFractionDigits: 0,
        }).format(value),
    },
    {
      field: "stock",
      headerName: "Stock",
      headerAlign: "center",
      renderCell: (params) => (
        <div
          style={{ width: "100%", display: "flex", justifyContent: "center" }}
        >
          {params.value}
        </div>
      ),
      width: 200,
      maxWidth: 200,
      type: "number",
      sortable: false,
    },
    {
      field: "actions",
      headerName: "Actions",
      headerAlign: "center",
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <div className="flex items-center justify-around w-full h-full">
          <EditIcon
            className="h-4 w-4 cursor-pointer z-[99999]"
            onClick={() => handleEditClick(params.row.id)}
            aria-label={`Edit ${params.row.name}`}
          />
          <Trash2Icon
            className="h-4 w-4 text-destructive cursor-pointer z-[99999]"
            onClick={() => handleDeleteClick(params.row.id)}
            aria-label={`Delete ${params.row.name}`}
          />
        </div>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" gutterBottom>
          Products
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <ProductCreateForm
            categories={categories}
            tags={tags}
            isOpen={isCreateDialogOpen}
            setIsOpen={setIsCreateDialogOpen}
          />
          <ProductEditForm
            product={editingProduct}
            categories={categories}
            tags={tags}
            isOpen={isEditDialogOpen}
            setIsOpen={setIsEditDialogOpen}
          />
          <ProductDeleteForm
            selectedRows={selectedRows}
            isOpen={isDeleteDialogOpen}
            setIsOpen={setIsDeleteDialogOpen}
            onDelete={(ids) => deleteMutation.mutate(ids)}
            isDeleting={deleteMutation.isPending}
          />
          <SingleProductDeleteForm
            productId={deletingProductId}
            productName={
              products.find((p) => p.id === deletingProductId)?.name || ""
            }
            isOpen={isSingleDeleteDialogOpen}
            setIsOpen={setIsSingleDeleteDialogOpen}
            onDelete={(id) => deleteMutation.mutate([id])}
            isDeleting={deleteMutation.isPending}
          />
        </Box>
      </Box>
      {error && (
        <Typography color="error" sx={{ fontSize: 11 }} gutterBottom>
          Error: {error.message}
        </Typography>
      )}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <DataGrid
          rows={products}
          columns={columns}
          loading={isLoading}
          pageSizeOptions={[5, 10, 25]}
          checkboxSelection
          slotProps={{
            loadingOverlay: { variant: "skeleton", noRowsVariant: "skeleton" },
          }}
          pagination
          disableRowSelectionOnClick
          disableColumnMenu
          onRowSelectionModelChange={handleRowSelection}
          sx={{
            ...dataGridSxStyles(isDarkMode),
            "& .MuiDataGrid-cell": {
              whiteSpace: "normal",
              wordWrap: "break-word",
            },
            width: "100%",
            "& .MuiDataGrid-main": { width: "100%" },
            "& .MuiDataGrid-virtualScroller": { width: "100%" },
            "& .MuiDataGrid-columnHeaderTitleContainer": {
              ".MuiSvgIcon-root": { color: isDarkMode ? "#f5f5f5" : "#1D1F21" },
            },
            ".MuiDataGrid-cell": {
              ".MuiSvgIcon-root": { color: isDarkMode ? "#f5f5f5" : "#1D1F21" },
            },
            ".MuiDataGrid-footerContainer": {
              ".MuiDataGrid-selectedRowCount": {
                color: isDarkMode ? "#f5f5f5" : "#1d1f21",
              },
            },
            "& .MuiDataGrid-columnHeaderCheckbox .MuiSvgIcon-root": {
              color: isDarkMode ? "#f5f5f5" : "#1D1F21",
              opacity: 1,
              pointerEvents: "auto",
            },
            "& .MuiDataGrid-cellCheckbox .MuiSvgIcon-root": {
              color: isDarkMode ? "#f5f5f5" : "#1D1F21",
              opacity: 1,
              pointerEvents: "auto",
            },
            "& .MuiDataGrid-overlay": {
              backgroundColor: "var(--background)",
              color: "var(--primary)",
            },
            "& .MuiDataGrid-scrollbar": {
              zIndex: 10,
            },
          }}
        />
      </div>
    </Box>
  );
}

// ErrorBoundary
export function ErrorBoundary() {
  return (
    <Box
      sx={{
        p: 3,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}
    >
      <Typography variant="h5" color="error">
        Error loading products
      </Typography>
      <Typography>Please try again later</Typography>
    </Box>
  );
}
