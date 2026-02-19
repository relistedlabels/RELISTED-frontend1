import { useQuery } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";

export const useTransactions = (
  page = 1,
  limit = 20,
  type: "deposit" | "debit" | "refund" | "withdrawal" | "all" = "all",
  status: "completed" | "pending" | "failed" | "all" = "all",
  sort: "newest" | "oldest" = "newest",
) =>
  useQuery({
    queryKey: ["renters", "transactions", page, limit, type, status, sort],
    queryFn: async () => {
      const response = await rentersApi.getTransactions({
        page,
        limit,
        type,
        status,
        sort,
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
