import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfile } from "@/lib/api/profile";
import type { UpdateProfilePayload, FullProfile } from "@/types/profile";

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfilePayload) => {
      const result = await updateProfile(data);
      return result;
    },
    onSuccess: (data: FullProfile) => {
      // Invalidate profile query to refetch
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      return data;
    },
    onError: (error: any) => {
      console.error("Failed to update profile:", error);
    },
  });
}
