import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDispute, type CreateDisputePayload } from "@/lib/api/listers";

export function useCreateDispute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDisputePayload) => createDispute(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["listers", "disputes"],
      });
    },
  });
}
