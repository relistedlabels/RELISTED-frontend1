import { useQuery } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";
import { useUserStore } from "@/store/useUserStore";

export const useProfile = (enabled: boolean = true) => {
  const token = useUserStore((s) => s.token);

  return useQuery({
    queryKey: ["renters", "profile"],
    queryFn: async () => {
      const response = await rentersApi.getProfile();
      return response.data?.profile;
    },
    staleTime: 10 * 60 * 1000,
    retry: 1,
    enabled: enabled && token !== null,
  });
};
