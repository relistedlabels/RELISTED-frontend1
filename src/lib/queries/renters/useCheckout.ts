import { useQuery } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";

/**
 * Validate cart before checkout
 * Checks wallet balance, expired items, and cart validity
 */
export const useValidateCheckout = () =>
  useQuery({
    queryKey: ["renters", "checkout", "validate"],
    queryFn: async () => {
      const response = await rentersApi.validateCheckout();
      return response.data;
    },
    staleTime: 10 * 1000, // 10 seconds - wallet balance can change
    retry: 1,
    enabled: false, // Manual trigger on "Checkout" button click
  });

/**
 * Get checkout summary before finalizing payment
 * Shows cart items, totals, wallet balance, and available balance after checkout
 */
export const useCheckoutSummary = (enabled: boolean = false) =>
  useQuery({
    queryKey: ["renters", "checkout", "summary"],
    queryFn: async () => {
      const response = await rentersApi.getCheckoutSummary();
      return response.data;
    },
    staleTime: 20 * 1000, // 20 seconds
    retry: 1,
    enabled, // Only fetch when user is on checkout page
  });
