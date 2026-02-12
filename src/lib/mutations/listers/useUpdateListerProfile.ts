import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateListerProfile,
  UpdateListerProfilePayload,
} from "@/lib/api/listers";

export function useUpdateListerProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateListerProfilePayload) => updateListerProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listers", "profile"] });
    },
  });
}
