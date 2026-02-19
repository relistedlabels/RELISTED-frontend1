import { useQuery } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";

export const useDashboardSummary = (
  timeframe: "week" | "month" | "year" = "month",
) =>
  useQuery({
    queryKey: ["renters", "dashboard", timeframe],
    queryFn: async () => {
      const response = await rentersApi.getDashboardSummary({ timeframe });
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
