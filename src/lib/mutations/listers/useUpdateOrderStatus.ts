import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateOrderStatus } from "@/lib/api/listers";

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      status,
      estimatedDeliveryDate,
    }: {
      orderId: string;
      status:
        | "approved"
        | "dispatched"
        | "in_transit"
        | "delivered"
        | "return_due"
        | "completed";
      estimatedDeliveryDate?: string;
    }) => updateOrderStatus(orderId, status, estimatedDeliveryDate),
    onSuccess: (data) => {
      // Invalidate orders list
      queryClient.invalidateQueries({
        queryKey: ["listers", "orders"],
      });
      // Invalidate specific order details
      queryClient.invalidateQueries({
        queryKey: ["listers", "orders", data.data.id],
      });
      // Invalidate order progress
      queryClient.invalidateQueries({
        queryKey: ["listers", "orders", data.data.id, "progress"],
      });
    },
  });
}
