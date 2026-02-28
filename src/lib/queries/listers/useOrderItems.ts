import { useQuery } from "@tanstack/react-query";
import { getOrderItems } from "@/lib/api/listers";

export function useOrderItems(orderId: string) {
  return useQuery({
    queryKey: ["listers", "orders", orderId, "items"],
    queryFn: () => getOrderItems(orderId),
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000,
  });
}
