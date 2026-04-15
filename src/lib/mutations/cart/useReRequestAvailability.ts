import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reRequestAvailability } from "@/lib/api/cart";

export const useReRequestAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cartItemId: string) => {
      return reRequestAvailability(cartItemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", "items"] });
      queryClient.invalidateQueries({
        queryKey: ["renters", "rental-requests"],
      });
      queryClient.invalidateQueries({ queryKey: ["renters", "cart"] });
      queryClient.invalidateQueries({
        queryKey: ["renters", "cart", "summary"],
      });
    },
  });
};
