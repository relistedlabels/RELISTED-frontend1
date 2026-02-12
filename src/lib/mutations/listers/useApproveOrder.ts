import { useMutation, useQueryClient } from "@tanstack/react-query";
import { approveOrder } from "@/lib/api/listers";

export function useApproveOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, notes }: { orderId: string; notes?: string }) =>
      approveOrder(orderId, notes),
    onSuccess: (data) => {
      // Invalidate orders list to refresh
      queryClient.invalidateQueries({
        queryKey: ["listers", "orders"],
      });
      // Invalidate specific order details
      queryClient.invalidateQueries({
        queryKey: ["listers", "orders", data.data.id],
      });
    },
  });
}
