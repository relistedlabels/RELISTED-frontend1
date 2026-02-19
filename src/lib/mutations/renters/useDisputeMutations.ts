import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";

export const useRaiseDispute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      orderId: string;
      itemId: string;
      issueCategory: string;
      description: string;
      amountDisputed?: number;
    }) => rentersApi.raiseDispute(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["renters", "disputes"] });
      queryClient.invalidateQueries({
        queryKey: ["renters", "disputes", "stats"],
      });
    },
  });
};
