import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addCartItemApi } from "@/lib/api/cart";
import { useOperationsPause } from "@/lib/queries/site/useOperationsPause";

/**
 * Mutation hook for adding an item to the cart (POST /cart-items/item)
 */
export const useAddCartItem = () => {
  const queryClient = useQueryClient();
  const { blockTransaction } = useOperationsPause();
  return useMutation({
    mutationFn: ({ productId, days }: { productId: string; days: number }) => {
      if (blockTransaction()) {
        return Promise.reject(new Error("operations_pause"));
      }
      return addCartItemApi(productId, days);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["renters", "cart"] });
      queryClient.invalidateQueries({
        queryKey: ["renters", "cart", "summary"],
      });
      queryClient.invalidateQueries({ queryKey: ["cart", "items"] });
    },
  });
};
