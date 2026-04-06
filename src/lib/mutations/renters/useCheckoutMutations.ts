import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrderApi } from "@/lib/api/cart";

/** @deprecated Use `usePassCart`. */
export const useCheckout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => createOrderApi(),
    onSuccess: () => {
      // Invalidate related queries after successful checkout
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

/**
 * Process checkout payment
 * Handles wallet deduction, card payments, or installment plans
 */

/**
 * Validate checkout before processing
 * Returns whether checkout is allowed and any errors
 */
