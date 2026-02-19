import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";

/**
 * Execute checkout to create orders from cart items
 * Transfers payment from wallet and clears cart
 */
export const useCheckout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data?: { applyCoupon?: string; notes?: string }) =>
      rentersApi.checkout(data),
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
export const useProcessCheckoutPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      method: "wallet" | "card" | "bank_transfer";
      amount: number;
      installments?: number;
    }) => rentersApi.processCheckoutPayment(data),
    onSuccess: () => {
      // Invalidate wallet and orders data
      queryClient.invalidateQueries({ queryKey: ["renters", "wallet"] });
      queryClient.invalidateQueries({ queryKey: ["renters", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["renters", "cart"] });
      queryClient.invalidateQueries({
        queryKey: ["renters", "transactions"],
      });
    },
  });
};

/**
 * Validate checkout before processing
 * Returns whether checkout is allowed and any errors
 */
export const useValidateCheckoutMutation = () =>
  useMutation({
    mutationFn: () => rentersApi.validateCheckout(),
  });
