import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addCartItemApi } from "@/lib/api/cart";

/**
 * Mutation hook for adding an item to the cart (POST /cart-items/item)
 */
export const useAddCartItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, days }: { productId: string; days: number }) =>
      addCartItemApi(productId, days),
    onSuccess: () => {
      // Invalidate cart queries so they refetch
      queryClient.invalidateQueries({ queryKey: ["renters", "cart"] });
      queryClient.invalidateQueries({
        queryKey: ["renters", "cart", "summary"],
      });
    },
  });
};
