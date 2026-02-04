import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productApi } from "@/lib/api/product";

/**
 * Toggle product availability - only works for APPROVED products
 * Sets status to AVAILABLE or UNAVAILABLE and updates isActive flag
 */
export const useToggleProductAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      isAvailable,
    }: {
      productId: string;
      isAvailable: boolean;
    }) => productApi.toggleAvailability(productId, isAvailable),
    onSuccess: () => {
      // Invalidate product queries
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["userProducts"] });
    },
  });
};
