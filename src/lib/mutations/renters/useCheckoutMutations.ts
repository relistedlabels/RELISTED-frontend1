import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";

/**
 * Execute checkout to create orders from cart items
 * Transfers payment from wallet and clears cart
 */
export const useCheckout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { requestId: string; confirmPayment?: boolean }) =>
      rentersApi.confirmRentalRequest(data.requestId, {
        confirmPayment: data.confirmPayment,
      }),
    onSuccess: () => {
      // Invalidate related queries after successful checkout
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
