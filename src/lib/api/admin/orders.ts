import { apiFetch } from "../http";

export interface Order {
  id: string;
  date: string;
  lister?: {
    id: string;
    name: string;
    avatar?: string | null;
  };
  renter?: {
    id: string;
    name: string;
    avatar?: string | null;
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
    | "IN_DISPUTE"
    | "Completed";
  returnDue: string;
  paymentReference: string;
}

export interface Return {
  id: string;
  orderId: string;
  status: "APPROVED" | "REJECTED" | "PENDING";
  itemCondition: "GOOD" | "FAIR" | "POOR";
  damageNotes: string;
  imageUrls: string[];
  createdAt: string;
  renter: {
    id: string;
    name: string;
    avatar: string | null;
  };
  lister: {
    id: string;
    name: string;
    avatar: string | null;
  };
  itemName: string;
}

export interface OrderPerson {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  avatar?: string | null;
}

export interface OrderDetail {
  id: string;
  internalId?: string;
  date: string;
  listingType?: string;
  status: string;
  items: number;
  total: number;
  returnDue?: string | null;
  paymentReference?: string | null;
  trackingNumber?: string | null;
  externalTrackingUrl?: string | null;
  lister?: OrderPerson | null;
  listers?: OrderPerson[];
  renter?: OrderPerson | null;
  items_details: Array<{
    id: string;
    productId?: string;
    name: string;
    image?: string | null;
    brand?: string | null;
    dailyPrice: number;
    rentalDays: number;
    cleaningFee?: number;
    collateralFee?: number;
    listingType?: string | null;
    subtotal: number;
    rentalStart?: string | null;
    rentalEnd?: string | null;
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
    vat: number;
    total: number;
    paymentStatus: string;
  };
  escrows?: Array<{
    id: string;
    status: string;
    lockedAmount: number;
    rentalAmount: number;
    resaleAmount?: number | null;
    collateralAmount: number;
    cleaningFee: number;
    listerId: string;
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

  getReturns: (params: Pick<OrderListParams, 'page' | 'limit'> = {}) =>
    apiFetch<{
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
    }>(`/api/admin/orders/returns?${buildOrderParams(params)}`),
};
