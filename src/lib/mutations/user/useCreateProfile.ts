import { useMutation } from "@tanstack/react-query";
import { createProfile } from "@/lib/api/profile";
import { useProfileStore } from "@/store/useProfileStore";

export function useCreateProfile() {
  const profile = useProfileStore((s) => s);
  const resetProfile = useProfileStore((s) => s.resetProfile);

  return useMutation({
    mutationFn: () => {
      return createProfile(profile);
    },
    onSuccess: () => {
      resetProfile();
      console.log("Profile sent and profile store reset");
    },
  });
}
