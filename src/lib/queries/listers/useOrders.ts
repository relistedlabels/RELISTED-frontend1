import { useQuery } from "@tanstack/react-query";
import { getOrders } from "@/lib/api/listers";

export function useOrders(
  status?: string,
  page: number = 1,
  limit: number = 20,
  sort: string = "-createdAt",
) {
  return useQuery({
    queryKey: ["listers", "orders", status, page, limit, sort],
    queryFn: () => getOrders(status, page, limit, sort),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
