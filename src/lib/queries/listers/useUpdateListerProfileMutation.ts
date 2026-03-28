import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateListerProfile } from "@/lib/api/listers";

export const useUpdateListerProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { bvn?: string; nin?: string }) =>
      updateListerProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["lister", "profile"],
      });
      queryClient.invalidateQueries({
        queryKey: ["lister", "verification", "status"],
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
