import { useQuery } from "@tanstack/react-query";
import { getBankAccounts } from "@/lib/api/listers";

export function useBankAccounts(verified: boolean = true) {
  return useQuery({
    queryKey: ["listers", "wallet", "bank-accounts", verified],
    queryFn: () => getBankAccounts(verified),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
