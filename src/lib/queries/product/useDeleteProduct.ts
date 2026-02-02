import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/http";

export const useDeleteProduct = (productId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return apiFetch<{ success: boolean }>(`/product/${productId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      // Invalidate product queries
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
