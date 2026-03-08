import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProduct } from "@/lib/api/listers";

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      reason,
    }: {
      productId: string;
      reason?: string;
    }) =>
      deleteProduct(productId, {
        reason,
      }),
    onSuccess: () => {
      // Invalidate inventory queries
      queryClient.invalidateQueries({
        queryKey: ["listers", "inventory"],
      });
    },
    onError: (error) => {
      console.error("Failed to delete product:", error);
    },
  });
};
