import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rejectOrder } from "@/lib/api/listers";

export function useRejectOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      reason,
      refundType,
    }: {
      orderId: string;
      reason: string;
      refundType?: "full";
    }) => rejectOrder(orderId, reason, refundType),
    onSuccess: () => {
      // Invalidate orders list to refresh
      queryClient.invalidateQueries({
        queryKey: ["listers", "orders"],
      });
    },
  });
}
