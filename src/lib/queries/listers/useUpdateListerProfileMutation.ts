import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateListerProfile } from "@/lib/api/listers";

export const useUpdateListerProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { bvn?: string; nin?: string }) =>
      updateListerProfile(data),
    onSuccess: () => {
      // Invalidate profile and verification queries
      queryClient.invalidateQueries({
        queryKey: ["lister", "profile"],
      });
      queryClient.invalidateQueries({
        queryKey: ["listers", "verifications", "status"],
      });
      queryClient.invalidateQueries({
        queryKey: ["profile"],
      });
    },
  });
};
