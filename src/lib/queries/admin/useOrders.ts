import { useQuery } from "@tanstack/react-query";
import { ordersApi } from "@/lib/api/admin/";

interface OrderListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  tab?: string;
}

export const useOrders = (params: OrderListParams = {}) =>
  useQuery({
    queryKey: [
      "admin",
      "orders",
      params.page,
      params.limit,
      params.search,
      params.status,
      params.tab,
    ],
    queryFn: () => ordersApi.getOrders(params),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

export const useOrderById = (orderId: string) =>
  useQuery({
    queryKey: ["admin", "orders", orderId],
    queryFn: () => ordersApi.getOrderById(orderId),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: !!orderId,
  });

export const useOrderStats = (timeframe: string = "all_time") =>
  useQuery({
    queryKey: ["admin", "orders", "stats", timeframe],
    queryFn: () => ordersApi.getOrderStats(timeframe),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

export const useOrderActivity = (orderId: string) =>
  useQuery({
    queryKey: ["admin", "orders", orderId, "activity"],
    queryFn: () => ordersApi.getOrderActivity(orderId),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: !!orderId,
  });
