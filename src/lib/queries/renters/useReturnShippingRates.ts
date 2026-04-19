import { useQuery } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";

export interface ShippingRate {
  name: string;
  pricingTier: string;
  totalShippingCost: number;
  estimatedDeliveryDays: number;
}

export const useReturnShippingRates = (orderId?: string) => {
  return useQuery({
    queryKey: ["renters", "orders", orderId, "return-shipping-rates"],
    queryFn: async () => {
      if (!orderId) throw new Error("Order ID is required");

      const response = await rentersApi.getReturnShippingRates(orderId);
      return response.data;
    },
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
