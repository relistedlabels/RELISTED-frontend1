import { useQuery } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";

export const useWalletBalance = () =>
  useQuery({
    queryKey: ["wallet", "wema", "balance"],
    queryFn: async () => {
      const response = await rentersApi.getWalletBalance();
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - wallet balance can change
    retry: 1,
  });
