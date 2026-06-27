import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";

export type ConfirmRentalDeliveryInput = {
  orderId: string;
  shipmentId?: string;
};

export const useConfirmRentalDelivery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, shipmentId }: ConfirmRentalDeliveryInput) =>
      rentersApi.confirmRentalDelivery(orderId, shipmentId),
    onSuccess: (_data, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ["renters", "orders"] });
      queryClient.invalidateQueries({
        queryKey: ["renters", "orders", orderId],
      });
      queryClient.invalidateQueries({
        queryKey: ["renters", "orders", orderId, "progress"],
      });
      queryClient.invalidateQueries({
        queryKey: ["renters", "dashboard", "summary"],
      });
    },
  });
};
