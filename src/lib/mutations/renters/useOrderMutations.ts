import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";

export const useInitiateReturn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      orderId: string;
      returnMethod: "pickup" | "dropoff";
      damageNotes?: string;
    }) =>
      rentersApi.initiateReturn(data.orderId, {
        returnMethod: data.returnMethod,
        damageNotes: data.damageNotes,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["renters", "orders", variables.orderId],
      });
      queryClient.invalidateQueries({ queryKey: ["renters", "orders"] });
    },
  });
};
