import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";

/**
 * Add item to cart (rental request)
 */
export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      productId: string;
      rentalStartDate: string;
      rentalEndDate: string;
      autoPay: boolean;
    }) => rentersApi.addToCart(data),
    onSuccess: () => {
      // Invalidate cart queries so they refetch
      queryClient.invalidateQueries({ queryKey: ["renters", "cart"] });
      queryClient.invalidateQueries({
        queryKey: ["renters", "cart", "summary"],
      });
      queryClient.invalidateQueries({
        queryKey: ["renters", "rental-requests"],
      });
    },
  });
};

/**
 * Remove specific item from cart
 */
export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cartItemId: string) => rentersApi.removeFromCart(cartItemId),
    onSuccess: () => {
      // Invalidate cart queries
      queryClient.invalidateQueries({ queryKey: ["renters", "cart"] });
      queryClient.invalidateQueries({
        queryKey: ["renters", "cart", "summary"],
      });
      queryClient.invalidateQueries({
        queryKey: ["renters", "rental-requests"],
      });
    },
  });
};

/**
 * Clear entire cart
 */
export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => rentersApi.clearCart(),
    onSuccess: () => {
      // Invalidate cart queries
      queryClient.invalidateQueries({ queryKey: ["renters", "cart"] });
      queryClient.invalidateQueries({
        queryKey: ["renters", "cart", "summary"],
      });
      queryClient.invalidateQueries({
        queryKey: ["renters", "rental-requests"],
      });
    },
  });
};
