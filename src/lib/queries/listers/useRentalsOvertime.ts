import { useQuery } from "@tanstack/react-query";
import { getRentalsOvertime } from "@/lib/api/listers";

export function useRentalsOvertime(
  timeframe: "month" | "quarter" | "year" = "year",
  year?: number,
) {
  return useQuery({
    queryKey: ["listers", "rentals", "overtime", timeframe, year],
    queryFn: () => getRentalsOvertime(timeframe, year),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
