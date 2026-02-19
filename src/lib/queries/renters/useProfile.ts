import { useQuery } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";

export const useProfile = () =>
  useQuery({
    queryKey: ["renters", "profile"],
    queryFn: async () => {
      const response = await rentersApi.getProfile();
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
