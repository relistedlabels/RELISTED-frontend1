import { useMutation, useQueryClient } from "@tanstack/react-query";
import { upgradeLister, UpgradeListerResponse } from "@/lib/api/listers";

export function useUpgradeLister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profileId: string) => upgradeLister(profileId),
    onSuccess: () => {
      // Invalidate relevant queries after upgrade
      queryClient.invalidateQueries({
        queryKey: ["listers", "profile"],
      });
    },
  });
}
