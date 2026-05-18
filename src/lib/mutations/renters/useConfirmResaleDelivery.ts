import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";

export type ConfirmResaleDeliveryInput = {
  orderId: string;
  shipmentId?: string;
};

export const useConfirmResaleDelivery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, shipmentId }: ConfirmResaleDeliveryInput) =>
      rentersApi.confirmResaleDelivery(orderId, shipmentId),
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
