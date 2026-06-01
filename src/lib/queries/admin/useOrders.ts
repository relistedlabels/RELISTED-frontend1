import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ordersApi, Order, Return, OrderStats } from "@/lib/api/admin/";

interface OrderListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  tab?: string;
  dateFrom?: string;
  dateTo?: string;
  type?: string;
  manualFulfillment?: boolean;
}

type OrdersResponse =
  | {
      success: true;
      data: {
        orders: Order[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          pages: number;
        };
        stats: OrderStats;
      };
    }
  | {
      success: true;
      data: {
        returns: Return[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          pages: number;
        };
      };
    };

export const useOrders = (params: OrderListParams = {}) =>
  useQuery<OrdersResponse>({
    queryKey: [
      "admin",
      "orders",
      params.page,
      params.limit,
      params.search,
      params.status,
      params.tab,
      params.dateFrom,
      params.dateTo,
      params.type,
      params.manualFulfillment,
    ],
    queryFn: () =>
      params.status === "Returns"
        ? ordersApi.getReturns({
            page: params.page,
            limit: params.limit,
            dateFrom: params.dateFrom,
            dateTo: params.dateTo,
          })
        : ordersApi.getOrders(params),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

export const useOrderById = (orderId: string, enabled = true) =>
  useQuery({
    queryKey: ["admin", "orders", orderId],
    queryFn: () => ordersApi.getOrderById(orderId),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: !!orderId && enabled,
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
