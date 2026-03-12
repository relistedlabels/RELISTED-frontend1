import { useQuery } from "@tanstack/react-query";
import { getWalletBalance } from "@/lib/api/listers";

export function useWalletBalance() {
  return useQuery({
    queryKey: ["listers", "wallet", "balance"],
    queryFn: getWalletBalance,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
