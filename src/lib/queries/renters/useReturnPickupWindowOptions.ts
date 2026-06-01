import { useQuery } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";

export type ReturnPickupWindowOption = {
  start: string;
  end: string;
  summary: string;
};

export type ReturnPickupWindowOptions = {
  scheduledDay: string;
  scheduledDayLabel: string;
  originalWindow: (ReturnPickupWindowOption & { expired: boolean }) | null;
  rescheduled: boolean;
  suggested: ReturnPickupWindowOption;
  sameDayOptions: ReturnPickupWindowOption[];
  pickupAddressSummary: string | null;
};

export const useReturnPickupWindowOptions = (
  orderId?: string,
  shipmentId?: string,
  enabled = true,
) => {
  return useQuery({
    queryKey: [
      "renters",
      "orders",
      orderId,
      "return-pickup-window-options",
      shipmentId ?? "default",
    ],
    queryFn: async () => {
      if (!orderId) throw new Error("Order ID is required");
      const response = await rentersApi.getReturnPickupWindowOptions(
        orderId,
        shipmentId,
      );
      return response.data as ReturnPickupWindowOptions;
    },
    enabled: Boolean(orderId) && enabled,
    staleTime: 60_000,
  });
};
