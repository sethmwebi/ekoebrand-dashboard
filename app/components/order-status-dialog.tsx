import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useUpdateOrderStatus } from "~/hooks/useUpdateOrderStatus";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { statusIcons, type Order, type OrderStatus } from "~/routes/orders";

interface OrderStatusDialogProps {
  order: Order;
  children?: React.ReactNode;
  onStatusUpdated?: () => void;
}

export function OrderStatusDialog({
  order,
  children,
  onStatusUpdated,
}: OrderStatusDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(
    order.status
  );
  const [error, setError] = useState<string | null>(null);
  const { mutate, isPending } = useUpdateOrderStatus();

  const handleStatusChange = (value: OrderStatus) => {
    setSelectedStatus(value);
    // Clear error when user changes selection
    setError(null);
  };

  const handleSubmit = () => {
    setError(null);
    mutate(
      { orderId: order.id, status: selectedStatus },
      {
        onSuccess: () => {
          setOpen(false);
          onStatusUpdated?.();
        },
        onError: (error) => {
          setError(error.message || "Failed to update order status");
        },
      }
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        // Reset error when dialog opens/closes
        if (!isOpen) setError(null);
      }}
    >
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm" disabled={isPending}>
            {isPending ? "Updating..." : "Change Status"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
        </DialogHeader>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 py-4">
          <Select
            value={selectedStatus}
            onValueChange={handleStatusChange}
            disabled={isPending}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(statusIcons).map(([status, Icon]) => (
                <SelectItem key={status} value={status}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span>{status.replace("_", " ")}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Updating..." : "Update Status"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
