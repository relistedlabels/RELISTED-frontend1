import { useQuery } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";
import { useUserStore } from "@/store/useUserStore";

export interface ShippingRate {
  name: string;
  pricingTier: string;
  totalShippingCost: number;
  estimatedDeliveryDays: number;
}

export const useReturnShippingRates = (orderId?: string) => {
  const token = useUserStore((s) => s.token);

  return useQuery({
    queryKey: ["renters", "orders", orderId, "return-shipping-rates"],
    queryFn: async () => {
      if (!orderId) throw new Error("Order ID is required");

      const response = await rentersApi.getReturnShippingRates(orderId);
      return response.data;
    },
    enabled: !!orderId && token !== null,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
