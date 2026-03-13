import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productsApi } from "@/lib/api/admin/listings";

/**
 * Delete a product as admin - removes listing completely from all tabs
 * Uses DELETE /api/admin/products/:productId
 */
export const useDeleteAdminProduct = (productId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => productsApi.deleteProduct(productId),
    onSuccess: (data) => {
      // Invalidate all product-related queries to refetch
      queryClient.invalidateQueries({ queryKey: ["admin", "listings"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "listings", "statistics"],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "listings", "detail"],
      });
      // Also invalidate all product tabs
      queryClient.invalidateQueries({
        queryKey: ["admin", "products", "pending"],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "products", "active"],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "products", "rejected"],
      });
    },
    onError: (error) => {
      console.error("Failed to delete admin product:", error);
    },
  });
};
