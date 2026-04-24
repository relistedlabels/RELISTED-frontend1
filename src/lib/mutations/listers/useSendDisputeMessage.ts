import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  type SendDisputeMessagePayload,
  sendDisputeMessage,
} from "@/lib/api/listers";

export function useSendDisputeMessage(disputeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendDisputeMessagePayload) =>
      sendDisputeMessage(disputeId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["listers", "disputes", "messages", disputeId],
      });
      queryClient.invalidateQueries({
        queryKey: ["listers", "disputes", "evidence", disputeId],
      });
    },
  });
}
