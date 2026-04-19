import { useQuery } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";

export const useProfile = (enabled: boolean = true) =>
  useQuery({
    queryKey: ["renters", "profile"],
    queryFn: async () => {
      const response = await rentersApi.getProfile();
      console.log("✅ Full API response:", response);
      const profile = response.data?.profile;
      console.log("✅ Extracted profile:", profile);
      console.log("✅ Profile nin:", profile?.nin);
      console.log("✅ Profile bvn:", profile?.bvn);
      return profile;
    },
    staleTime: 10 * 60 * 1000,
    retry: 1,
    enabled,
  });
