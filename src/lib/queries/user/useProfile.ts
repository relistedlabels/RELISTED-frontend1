// lib/queries/profile/useProfile.ts
import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@/lib/api/profile";
import { FullProfile } from "@/types/profile";
import { useProfileStore } from "@/store/profileStore";

export const useProfile = () => {
  const setProfile = useProfileStore((s) => s.setProfile);

  return useQuery<FullProfile>({
    queryKey: ["profile"],
    queryFn: async () => {
      const profile = await getProfile();
      console.log("PROFILE FETCHED:", profile);
      setProfile(profile);
      return profile;
    },
    retry: false,
  });
};
