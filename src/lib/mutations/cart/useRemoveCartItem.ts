import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeCartItem } from "@/lib/api/cart";

export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cartItemId: string) => removeCartItem(cartItemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", "items"] });
      queryClient.invalidateQueries({ queryKey: ["renters", "rental-requests"] });
      queryClient.invalidateQueries({ queryKey: ["renters", "cart"] });
      queryClient.invalidateQueries({
        queryKey: ["renters", "cart", "summary"],
      });
    },
  });
};
