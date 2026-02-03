import { useMutation } from "@tanstack/react-query";
import { updateProfile } from "@/lib/api/profile";
import { useProfileStore } from "@/store/useProfileStore";
import { useUserStore } from "@/store/useUserStore";

export function useUpdateProfile() {
  const userId = useUserStore((s) => s.userId);
  const profile = useProfileStore((s) => s);
  const resetProfile = useProfileStore((s) => s.resetProfile);

  return useMutation({
    mutationFn: () => {
      if (!userId) throw new Error("No user id");
      return updateProfile( profile);
    },
    onSuccess: () => {
      resetProfile(); // optional but recommended
    },
  });
}
