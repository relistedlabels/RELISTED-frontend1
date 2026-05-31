import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";

interface ReturnWithShippingParams {
  orderId: string;
  shipmentId?: string;
  images: string[];
  damageNotes?: string;
  itemCondition: "GOOD" | "FAIR" | "POOR";
  pickupWindow?: { start: string; end: string };
}

export const useInitiateReturn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: ReturnWithShippingParams) => {
      const {
        orderId,
        shipmentId,
        images,
        damageNotes = "",
        itemCondition = "GOOD",
        pickupWindow,
      } = params;

      const response = await rentersApi.returnWithShipping(orderId, {
        itemCondition,
        damageNotes,
        images,
        ...(shipmentId ? { shipmentId } : {}),
        ...(pickupWindow ? { pickupWindow } : {}),
      });

      return response;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["renters", "orders", variables.orderId],
      });
      queryClient.invalidateQueries({
        queryKey: ["renters", "orders", variables.orderId, "progress"],
      });
      queryClient.invalidateQueries({
        queryKey: ["renters", "orders"],
      });
    },
  });
};
