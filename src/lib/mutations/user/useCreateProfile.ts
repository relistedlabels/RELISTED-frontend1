import { useMutation } from "@tanstack/react-query";
import { createProfile } from "@/lib/api/profile";
import { useProfileStore } from "@/store/useProfileStore";
import { useInvalidateProfile } from "@/lib/queries/user/useProfile";

export function useCreateProfile() {
  const profile = useProfileStore((s) => s);
  const resetProfile = useProfileStore((s) => s.resetProfile);
  const invalidateProfile = useInvalidateProfile();

  return useMutation({
    mutationFn: () => {
      return createProfile(profile);
    },
    onSuccess: () => {
      // Clear local profile store - we'll fetch from server when needed
      resetProfile();

      // Invalidate the profile cache to refetch fresh data
      invalidateProfile();

      console.log("Profile created successfully, store cleared");
    },
  });
}
