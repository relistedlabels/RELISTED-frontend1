import { useMutation, useQueryClient } from "@tanstack/react-query";
import { passCartApi } from "@/lib/api/cart";
import {
  buildPassCartPayload,
  type PassCartMutationInput,
} from "@/lib/checkout/buildPassCartPayload";

export type { PassCartMutationInput };

export const usePassCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: PassCartMutationInput) =>
      passCartApi(buildPassCartPayload(input)),
    onSuccess: () => {
      // Clear all cart-related caches
      queryClient.invalidateQueries({ queryKey: ["cart", "items"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["renters", "cart"] });
      queryClient.invalidateQueries({
        queryKey: ["renters", "cart", "summary"],
      });
      queryClient.invalidateQueries({ queryKey: ["renters", "orders"] });
      queryClient.invalidateQueries({
        queryKey: ["renters", "dashboard", "summary"],
      });
      queryClient.invalidateQueries({ queryKey: ["renters", "wallet"] });
      // Invalidate all rental request statuses to refresh cart display
      queryClient.invalidateQueries({ queryKey: ["renters", "rental-requests"] });
      // Also clear any pending cart items
      queryClient.clear();
    },
  });
};
