import { useMutation, useQueryClient } from "@tanstack/react-query";
import { passCartApi } from "@/lib/api/cart";

/**
 * Pass cart with selected shipping tier to prepare checkout
 * Posts the selected shipping method to the backend
 */
export const usePassCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (shippingTierName: string) => passCartApi(shippingTierName),
    onSuccess: () => {
      // Invalidate order summary to refresh with new shipping tier
      queryClient.invalidateQueries({
        queryKey: ["renters", "cart", "summary"],
      });
    },
  });
};
