import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/lib/api/listers";

export function useDashboardStats(
  timeframe: "week" | "month" | "year" = "month",
) {
  return useQuery({
    queryKey: ["listers", "stats", timeframe],
    queryFn: () => getDashboardStats(timeframe),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
