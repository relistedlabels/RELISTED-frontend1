import { useQuery } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";

/**
 * Fetch shopping cart with all pending items and summary
 * Includes cart total, delivery fees, cleaning fees, and expired items
 */
export const useCart = () =>
  useQuery({
    queryKey: ["renters", "cart"],
    queryFn: async () => {
      const response = await rentersApi.getCart();
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds - cart items expire in 15 min, so frequent updates
    retry: 1,
    refetchInterval: 5000, // Poll every 5 seconds to update timers
  });

/**
 * Get cart summary with calculated totals
 * Used for cart display and payment processing
 */
export const useCartSummary = () =>
  useQuery({
    queryKey: ["renters", "cart", "summary"],
    queryFn: async () => {
      const response = await rentersApi.getCartSummary();
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
    retry: 1,
    refetchInterval: 5000, // Poll for timer updates
  });
