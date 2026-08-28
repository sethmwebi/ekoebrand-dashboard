import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import {
  CircularProgress,
  Typography,
  Box,
  Avatar,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
} from "@mui/material";
import { useTheme } from "~/providers/theme-provider";
import { dataGridSxStyles, dataGridClassNames } from "~/lib/mui-theme";
import { Mail, MoreVertical, Edit, Trash2, Eye } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CustomerDetailsDialog } from "~/components/customer-details-dialog";
import { CustomerEditDialog } from "~/components/customer-edit-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";
import { Button } from "~/components/ui/button";
import { fetcher } from "~/helpers/fetcher";

export interface Customer {
  id: string;
  name: string | null;
  email: string;
  mobileNumber: string | null;
  image: string | null;
  role: string;
  createdAt: string;
  address: {
    street: string;
    city: string;
    county: string;
    postalCode: string;
    country: string;
    pickupLocation: string | null;
  };
  _count: {
    orders: number;
  };
}

export function CustomersTable() {
  const { isDarkMode } = useTheme();
  const queryClient = useQueryClient();
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);

  const {
    data: customersData,
    isLoading,
    error,
  } = useQuery<Customer[], Error>({
    queryKey: ["customers"],
    queryFn: async (): Promise<Customer[]> => {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/v1/api/users?role=USER&sort=-createdAt,id`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch customers");
      }
      return await response.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await fetcher("/user/delete", {
        method: "DELETE",
        body: JSON.stringify({ id: userId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setDeleteDialogOpen(false);
    },
  });

  const customers = customersData || [];

  const handleOpenDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setOpenDetailsDialog(true);
  };

  const handleOpenEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setOpenEditDialog(true);
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    customer: Customer
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedCustomer(customer);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    if (selectedCustomer) {
      handleOpenEdit(selectedCustomer);
    }
    handleMenuClose();
  };

  const handleViewDetails = () => {
    if (selectedCustomer) {
      handleOpenDetails(selectedCustomer);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    if (selectedCustomer) {
      setCustomerToDelete(selectedCustomer.id);
      setDeleteDialogOpen(true);
    }
    handleMenuClose();
  };

  const confirmDelete = () => {
    if (customerToDelete) {
      deleteMutation.mutate(customerToDelete);
    }
  };

  const columns: GridColDef<Customer>[] = [
    {
      field: "image",
      headerName: "",
      width: 60,
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            height: "100%",
            gap: 1,
            lineHeight: "initial",
          }}
        >
          <Avatar
            src={params.value || undefined}
            alt={params.row.name || "Customer"}
            sx={{ width: 32, height: 32 }}
            className="!bg-foreground-muted"
          >
            {params.row.name?.charAt(0) || params.row.email.charAt(0)}
          </Avatar>
        </Box>
      ),
      sortable: false,
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <div>
          <div className="font-medium">
            {params.value || params.row.email.split("@")[0]}
          </div>
          {params.value && (
            <div className="text-xs text-gray-500">{params.row.email}</div>
          )}
        </div>
      ),
      sortable: false,
    },
    {
      field: "contact",
      headerName: "Contact",
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            height: "100%",
            gap: 1,
            lineHeight: "initial",
          }}
        >
          <Mail size={14} />
          <span className="text-sm">{params.row.email}</span>
        </Box>
      ),
      sortable: false,
    },
    {
      field: "location",
      headerName: "Location",
      minWidth: 150,
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            height: "100%",
            gap: 1,
            lineHeight: "initial",
          }}
        >
          {params.row.address ? (
            <div className="text-sm">{params.row.address.county}</div>
          ) : (
            <div className="text-sm text-gray-500">No address</div>
          )}
        </Box>
      ),
      sortable: false,
    },
    {
      field: "orders",
      headerName: "Orders",
      headerAlign: "center",
      align: "center",
      width: 100,
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            gap: 1,
            lineHeight: "initial",
          }}
        >
          <span>{params.row._count.orders}</span>
        </Box>
      ),
    },
    {
      field: "createdAt",
      headerName: "Joined",
      align: "center",
      headerAlign: "center",
      width: 120,
      valueFormatter: ({ value }: { value: Date }) => {
        return new Intl.DateTimeFormat("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(value);
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      headerAlign: "center",
      width: 120,
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            gap: 1,
            lineHeight: "initial",
          }}
        >
          <Tooltip title="View details">
            <IconButton
              onClick={() => handleOpenDetails(params.row)}
              size="small"
              color="inherit"
            >
              <Eye size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title="More actions">
            <IconButton
              onClick={(e) => handleMenuOpen(e, params.row)}
              size="small"
              color="inherit"
            >
              <MoreVertical size={18} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
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
        <Typography color="error">Error loading customers</Typography>
      </div>
    );
  }

  if (!customers.length) {
    return <Typography>No customers found</Typography>;
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: "auto" }}>
      <Typography variant="h5" gutterBottom>
        Customers
      </Typography>
      <DataGrid
        rows={customers}
        columns={columns}
        pageSizeOptions={[10, 25, 50]}
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

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        sx={{
          "& .MuiMenu-paper": {
            backgroundColor: "var(--background)",
            color: "var(--primary)",
          },
        }}
      >
        <MenuItem onClick={handleEdit} className="hover:!bg-secondary">
          <Edit size={16} style={{ marginRight: 8 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} className="hover:!bg-secondary">
          <Trash2 size={16} style={{ marginRight: 8 }} color="#ef4444" />
          <span style={{ color: "#ef4444" }}>Delete</span>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md bg-background">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Delete Customer
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Are you sure you want to delete this customer? This action cannot be
            undone.
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                variant="outline"
                disabled={deleteMutation.isPending}
                className="border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-200"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={confirmDelete}
              variant="destructive"
              disabled={deleteMutation.isPending}
              className="bg-red-600 cursor-pointer text-white hover:bg-red-700"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customer Details Dialog */}
      {selectedCustomer && (
        <CustomerDetailsDialog
          open={openDetailsDialog}
          onOpenChange={setOpenDetailsDialog}
          customer={selectedCustomer}
        />
      )}

      {/* Customer Edit Dialog */}
      {selectedCustomer && (
        <CustomerEditDialog
          open={openEditDialog}
          onOpenChange={setOpenEditDialog}
          customer={selectedCustomer}
        />
      )}
    </Box>
  );
}

export default CustomersTable;
