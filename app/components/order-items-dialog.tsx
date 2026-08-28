import { CircularProgress, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "~/providers/theme-provider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";
import { ScrollArea } from "./ui/scroll-area";

interface OrderItem {
  id: string;
  quantity: number;
  productId: string;
}

interface Product {
  id: string;
  name: string;
  images: string[];
}

interface Order {
  id: string;
  items: OrderItem[];
}

interface OrderItemsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
}

export function OrderItemsDialog({
  open,
  onOpenChange,
  order,
}: OrderItemsDialogProps) {
  const { isDarkMode } = useTheme();

  const fetchProducts = async (productIds: string[]): Promise<Product[]> => {
    const promises = productIds.map((productId) =>
      fetch(
        `${import.meta.env.VITE_BACKEND_URL}/v1/api/products/${productId}`
      ).then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch product ${productId}`);
        return res.json() as Promise<Product>;
      })
    );
    return Promise.all(promises);
  };

  const productIds = order?.items.map((item) => item.productId) || [];
  const {
    data: products = [],
    isLoading: isLoadingProducts,
    error: errorProducts,
  } = useQuery({
    queryKey: ["products", productIds],
    queryFn: () => fetchProducts(productIds),
    enabled: open && !!order && productIds.length > 0,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  if (!order) {
    return null; // Prevent rendering if order is null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-3 md:p-5 max-h-[90h] max-w-[80%] ml-4 md:ml-0 overflow-hidden">
        <DialogHeader>
          <DialogTitle>Order Items</DialogTitle>
          <DialogDescription className="-mb-1.5">
            Details of products in Order {order.id.slice(0, 5)}...
            {order.id.slice(-3)}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] w-full pr-4">
          {isLoadingProducts ? (
            <div className="flex justify-center items-center h-40">
              <CircularProgress
                style={{ color: isDarkMode ? "#ff6700" : "#ff7a20" }}
              />
            </div>
          ) : errorProducts ? (
            <Typography color="error">
              {errorProducts instanceof Error
                ? errorProducts.message
                : "An error occurred"}
            </Typography>
          ) : (
            <div className="space-y-2 md:space-y-4">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center gap-2 md:gap-4 p-2 md:p-4 border rounded-md"
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-12 h-12 md:w-16 md:h-16 object-cover rounded"
                  />
                  <div>
                    <Typography variant="subtitle1">{product.name}</Typography>
                    <Typography variant="body2">
                      Quantity: {order.items[index]?.quantity}
                    </Typography>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default OrderItemsDialog;
