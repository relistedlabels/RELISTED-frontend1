import { apiFetch } from "../http";

export interface Order {
  id: string;
  date: string;
  curator: {
    id: string;
    name: string;
    avatar: string;
  };
  dresser: {
    id: string;
    name: string;
    avatar: string;
  };
  items: number;
  total: number;
  status:
    | "Preparing"
    | "In Transit"
    | "Delivered"
    | "Return Due"
    | "Return Pickup"
    | "Disputed"
    | "Completed";
  returnDue: string;
  paymentReference: string;
}

export interface OrderDetail extends Order {
  curator: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar: string;
  };
  dresser: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar: string;
  };
  items_details: Array<{
    id: string;
    name: string;
    image: string;
    brand: string;
    dailyPrice: number;
    rentalDays: number;
    subtotal: number;
  }>;
  shipping: {
    rentalPeriod: string;
    trackingId: string;
    courier: string;
    pickupDate: string;
    expectedDelivery: string;
  };
  payment: {
    subtotal: number;
    serviceFee: number;
    deliveryFee: number;
    insurance: number;
    total: number;
    paymentStatus: string;
  };
  activity: Array<{
    id: string;
    title: string;
    timestamp: string;
    actor: string;
    type: string;
  }>;
}

export interface OrderStats {
  totalListings: number;
  completedOrders: number;
  activeOrders: number;
  disputedOrders: number;
  totalRevenue: number;
}

interface OrderListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  tab?: string;
}

function buildOrderParams(params: OrderListParams): string {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.append("page", params.page.toString());
  if (params.limit) searchParams.append("limit", params.limit.toString());
  if (params.search) searchParams.append("search", params.search);
  if (params.status) searchParams.append("status", params.status);
  if (params.tab) searchParams.append("tab", params.tab);
  return searchParams.toString();
}

export const ordersApi = {
  getOrders: (params: OrderListParams) =>
    apiFetch<{
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
    }>(`/api/admin/orders?${buildOrderParams(params)}`),

  getOrderById: (orderId: string) =>
    apiFetch<{ success: true; data: OrderDetail }>(
      `/api/admin/orders/${orderId}`,
    ),

  getOrderStats: (timeframe: string = "all_time") =>
    apiFetch<{ success: true; data: OrderStats }>(
      `/api/admin/orders/stats?timeframe=${timeframe}`,
    ),

  getOrderActivity: (orderId: string) =>
    apiFetch<{
      success: true;
      data: {
        events: Array<{
          id: string;
          timestamp: string;
          title: string;
          description: string;
          actor: {
            id: string;
            name: string;
            role: string;
          };
          type: string;
        }>;
      };
    }>(`/api/admin/orders/${orderId}/activity`),

  updateOrderStatus: (orderId: string, status: string, reason?: string) =>
    apiFetch(`/api/admin/orders/${orderId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, reason }),
    }),

  cancelOrder: (
    orderId: string,
    reason: string,
    notifyParties: boolean = true,
  ) =>
    apiFetch(`/api/admin/orders/${orderId}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason, notifyParties }),
    }),

  exportOrders: (format: "csv" | "xlsx", filters?: any) =>
    apiFetch(`/api/admin/orders/export?format=${format}`, {
      method: "GET",
    }),
};
