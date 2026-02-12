import { useQuery } from "@tanstack/react-query";
import { getRecentRentals } from "@/lib/api/listers";

export function useRecentRentals(
  page: number = 1,
  limit: number = 10,
  status: string = "all",
) {
  return useQuery({
    queryKey: ["listers", "rentals", "recent", page, limit, status],
    queryFn: () => getRecentRentals(page, limit, status),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
