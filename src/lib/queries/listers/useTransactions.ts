import { useQuery } from "@tanstack/react-query";
import { getTransactions } from "@/lib/api/listers";

export function useTransactions(
  page: number = 1,
  limit: number = 10,
  type: "credit" | "debit" | "all" = "all",
  sortBy: string = "-date",
) {
  return useQuery({
    queryKey: ["listers", "wallet", "transactions", page, limit, type, sortBy],
    queryFn: () => getTransactions(page, limit, type, sortBy),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
