import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateBusinessProfile,
  UpdateBusinessProfilePayload,
} from "@/lib/api/listers";

export function useUpdateBusinessProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateBusinessProfilePayload) =>
      updateBusinessProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["listers", "businessProfile"],
      });
    },
  });
}
