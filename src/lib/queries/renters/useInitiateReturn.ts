import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";

interface ReturnWithShippingParams {
  orderId: string;
  images: string[];
  damageNotes?: string;
  itemCondition: "GOOD" | "FAIR" | "POOR";
}

export const useInitiateReturn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: ReturnWithShippingParams) => {
      const {
        orderId,
        images,
        damageNotes = "",
        itemCondition = "GOOD",
      } = params;

      const response = await rentersApi.returnWithShipping(orderId, {
        itemCondition,
        damageNotes,
        images,
      });

      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries to refresh data
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
