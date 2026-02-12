import { useMutation } from "@tanstack/react-query";
import { updateProfile } from "@/lib/api/profile";
import type { UpdateProfilePayload } from "@/types/profile";
import { useInvalidateProfile } from "@/lib/queries/user/useProfile";

export function useUpdateProfile() {
  const invalidateProfile = useInvalidateProfile();

  return useMutation({
    mutationFn: (data: UpdateProfilePayload) => updateProfile(data),
    onSuccess: () => {
      invalidateProfile();
    },
  });
}
