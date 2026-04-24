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
      preferredResolution?: string;
      evidenceFiles?: string[];
    }) =>
      rentersApi.raiseDispute({
        ...data,
        amountDisputed: data.amountDisputed ?? 0,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["renters", "disputes"] });
      queryClient.invalidateQueries({ queryKey: ["renters", "disputes", "stats"] });
    },
  });
};

export const useSendDisputeMessage = (disputeId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { message: string; attachmentUrls?: string[] }) =>
      rentersApi.sendDisputeMessage(disputeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["renters", "disputes", disputeId, "messages"],
      });
    },
  });
};
