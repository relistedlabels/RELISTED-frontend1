import { useQuery } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";

export const useProfile = () =>
  useQuery({
    queryKey: ["renters", "profile"],
    queryFn: async () => {
      const response = await rentersApi.getProfile();
      console.log("📦 useProfile - Full API response:", response);
      console.log("📦 useProfile - response.data:", response.data);
      console.log(
        "📦 useProfile - response.data.profile:",
        response.data?.profile,
      );
      return response.data?.profile || response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
