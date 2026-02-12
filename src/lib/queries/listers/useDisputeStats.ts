import { useQuery } from "@tanstack/react-query";
import { getDisputeStats } from "@/lib/api/listers";

export function useDisputeStats(
  timeframe: "week" | "month" | "year" = "month",
) {
  return useQuery({
    queryKey: ["listers", "disputes", "stats", timeframe],
    queryFn: () => getDisputeStats(timeframe),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
