import { useQuery } from "@tanstack/react-query";
import { getOrderDetails } from "@/lib/api/listers";

export function useOrderDetails(orderId: string) {
  return useQuery({
    queryKey: ["listers", "orders", orderId, "details"],
    queryFn: () => getOrderDetails(orderId),
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
