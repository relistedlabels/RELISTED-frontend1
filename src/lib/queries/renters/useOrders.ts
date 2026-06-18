import { useQuery } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";
import { useUserStore } from "@/store/useUserStore";

export const useOrders = (
  status?: "active" | "completed" | "returned" | "cancelled",
  page = 1,
  limit = 10,
  sort: "newest" | "oldest" | "ending_soon" = "newest",
) => {
  const token = useUserStore((s) => s.token);

  return useQuery({
    queryKey: ["renters", "orders", status, page, limit, sort],
    queryFn: async () => {
      const response = await rentersApi.getOrders({
        status,
        page,
        limit,
        sort,
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: token !== null,
  });
};

export const useOrder = (orderId: string) => {
  const token = useUserStore((s) => s.token);

  return useQuery({
    queryKey: ["renters", "order", orderId],
    queryFn: async () => {
      const response = await rentersApi.getOrderDetails(orderId);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: !!orderId && token !== null,
  });
};
