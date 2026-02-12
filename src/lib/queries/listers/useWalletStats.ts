import { useQuery } from "@tanstack/react-query";
import { getWalletStats } from "@/lib/api/listers";

export function useWalletStats() {
  return useQuery({
    queryKey: ["listers", "wallet", "stats"],
    queryFn: getWalletStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
