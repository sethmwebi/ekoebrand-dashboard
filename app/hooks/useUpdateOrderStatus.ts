// ~/hooks/useUpdateOrderStatus.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Order, OrderStatus } from "~/routes/orders";
// import { toast } from "~/components/ui/use-toast";
import type { DashboardData } from "~/routes/dashboard";

interface UpdateOrderStatusParams {
  orderId: string;
  status: OrderStatus;
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: UpdateOrderStatusParams) => {
      const response = await fetch(
        `http://localhost:8000/v1/api/admin/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update order status");
      }
      return response.json();
    },

    // Optimistic update logic
    onMutate: async ({ orderId, status }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["orders"] });
      await queryClient.cancelQueries({
        queryKey: ["dashboard-data", "orders"],
      });

      // Snapshot previous values
      const previousOrders = queryClient.getQueryData<Order[]>(["orders"]);
      const previousDashboard = queryClient.getQueryData<DashboardData>([
        "dashboard-data",
        "orders",
      ]);

      // Optimistically update orders list
      queryClient.setQueryData<Order[]>(
        ["orders"],
        (old) =>
          old?.map((order) =>
            order.id === orderId ? { ...order, status } : order
          ) ?? []
      );

      // Optimistically update dashboard counts
      if (previousDashboard && previousOrders) {
        const order = previousOrders.find((o) => o.id === orderId);
        if (order) {
          queryClient.setQueryData<DashboardData>(
            ["dashboard-data", "orders"],
            (old) => {
              if (!old) return previousDashboard;

              const updated = { ...old };

              // Decrement old status count
              if (order.status === "PENDING") updated.pendingOrders--;
              if (order.status === "PROCESSING") updated.processingOrders--;
              if (order.status === "DELIVERED") updated.deliveredOrders--;

              // Increment new status count
              if (status === "PENDING") updated.pendingOrders++;
              if (status === "PROCESSING") updated.processingOrders++;
              if (status === "DELIVERED") updated.deliveredOrders++;

              return updated;
            }
          );
        }
      }

      return { previousOrders, previousDashboard };
    },

    // Error handling (rollback)
    onError: (error, variables, context) => {
      // Rollback orders list
      if (context?.previousOrders) {
        queryClient.setQueryData(["orders"], context.previousOrders);
      }

      // Rollback dashboard data
      if (context?.previousDashboard) {
        queryClient.setQueryData(
          ["dashboard-data", "orders"],
          context.previousDashboard
        );
      }

      // toast({
      //   title: "Error",
      //   description: error.message,
      //   variant: "destructive",
      // });
    },

    // Success handling
    // onSuccess: () => {
    //   toast({
    //     title: "Success",
    //     description: "Order status updated successfully",
    //   });
    // },

    // Always invalidate queries after mutation
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-data", "orders"] });
    },
  });
}
