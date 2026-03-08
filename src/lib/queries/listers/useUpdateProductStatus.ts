import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProductStatus } from "@/lib/api/listers";

export const useUpdateProductStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      status,
      reason,
      expectedReturnDate,
    }: {
      productId: string;
      status: "AVAILABLE" | "MAINTENANCE" | "RENTED" | "RESERVED";
      reason?: string;
      expectedReturnDate?: string;
    }) =>
      updateProductStatus(productId, {
        status,
        reason,
        expectedReturnDate,
      }),
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ["listers", "inventory"],
      });
      queryClient.invalidateQueries({
        queryKey: ["listers", "inventory", data.data.id],
      });
    },
    onError: (error) => {
      console.error("Failed to update product status:", error);
    },
  });
};
