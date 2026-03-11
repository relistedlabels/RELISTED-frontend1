import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrderApi } from "@/lib/api/cart";

/**
 * Mutation hook for creating an order from cart (POST /order)
 */
export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => createOrderApi(),
    onSuccess: () => {
      // Invalidate cart queries after order is created
      queryClient.invalidateQueries({ queryKey: ["cart", "items"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};
