import { useQuery } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";

export const useProfile = (enabled: boolean = true) =>
  useQuery({
    queryKey: ["renters", "profile"],
    queryFn: async () => {
      const response = await rentersApi.getProfile();
      return response.data?.profile;
    },
    staleTime: 10 * 60 * 1000,
    retry: 1,
    enabled,
  });
