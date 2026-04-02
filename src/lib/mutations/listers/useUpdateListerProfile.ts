import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateListerProfile,
  UpdateListerProfilePayload,
} from "@/lib/api/listers";

export function useUpdateListerProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateListerProfilePayload) => updateListerProfile(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["listers", "profile"] });
      await queryClient.invalidateQueries({
        queryKey: ["listers", "wallet", "bank-accounts"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["listers", "wallet", "balance"],
      });
      await queryClient.refetchQueries({
        queryKey: ["listers", "wallet", "bank-accounts"],
      });
    },
  });
}
