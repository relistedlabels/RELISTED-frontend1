import { useMutation, useQueryClient } from "@tanstack/react-query";
import { passCartApi } from "@/lib/api/cart";

export const usePassCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (shippingTierName: string) => passCartApi(shippingTierName),
    onSuccess: () => {
      // Invalidate order summary to refresh with new shipping tier
      queryClient.invalidateQueries({ queryKey: ["cart", "items"] });
      queryClient.invalidateQueries({ queryKey: ["renters", "cart"] });
      queryClient.invalidateQueries({
        queryKey: ["renters", "cart", "summary"],
      });
      queryClient.invalidateQueries({ queryKey: ["renters", "orders"] });
      queryClient.invalidateQueries({
        queryKey: ["renters", "dashboard", "summary"],
      });
      queryClient.invalidateQueries({ queryKey: ["renters", "wallet"] });
      queryClient.invalidateQueries({
        queryKey: ["renters", "rental-requests"],
      });
    },
  });
};
