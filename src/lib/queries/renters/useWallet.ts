import { useQuery } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";

export const useWallet = () =>
  useQuery({
    queryKey: ["renters", "wallet"],
    queryFn: async () => {
      const response = await rentersApi.getWallet();
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - wallet balance can change
    retry: 1,
  });
