import { useMutation, useQueryClient } from "@tanstack/react-query";
import { withdrawDispute } from "@/lib/api/listers";

export function useWithdrawDispute(disputeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => withdrawDispute(disputeId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["listers", "disputes"],
      });
    },
  });
}
