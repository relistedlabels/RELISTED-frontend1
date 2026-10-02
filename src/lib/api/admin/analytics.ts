import { apiFetch } from "../http";

export interface AnalyticsStats {
  totalOrders: number;
  totalRevenue: number;
  previousPeriod: {
    orders: number;
    revenue: number;
  } | null;
  activeListings: number;
  activeDisputes: number;
  /** Renters or listers with order, availability request, or app visit in the period */
  activeUsers: number;
  avgDeliveryTime: number;
  /** Dispatch → delivered, whole minutes (preferred for display). */
  avgDeliveryTimeMinutes?: number;
  deliveryTimeSampleSize?: number;
  ordersWithDisputes: number;
  disputeRate: number;
  timeframe: string;
  period: string;
}

export interface TrendData {
  /** Daily label for month views; month/year label for year and all-time views. */
  month: string;
  orders: number;
  revenue: number;
  /** @deprecated Use orders */
  rentals?: number;
}

export interface CategoryBreakdown {
  category: string;
  activeListings: number;
  availabilityRequests: number;
}

export interface RevenueByCategory {
  category: string;
  amount: number;
}

export interface TopCurator {
  id: string;
  name: string;
  avatar: string | null;
  totalRentals: number;
  totalProducts: number;
  revenue: number;
}

export interface TopItem {
  id: string;
  name: string;
  brand: string | null;
  rentalsCount: number;
  earnings: number;
}

export interface DashboardActivityItem {
  id: string;
  kind:
    | "rental_request"
    | "purchase_request"
    | "listing_review"
    | "order_placed"
    | "order_completed"
    | "dispute_opened"
    | "withdrawal_requested"
    | "payout_released";
  title: string;
  detail: string;
  amount: number | null;
  createdAt: string;
}

export interface DashboardOverview {
  needsAttention: {
    newListingReviews: number;
    availabilityRequests: number;
    listersNotResponding: number;
    returnOverdue: number;
    deliveriesToday: number;
    disputesPending: number;
    withdrawalRequests: number;
  };
  today: {
    rentalsGoingOut: number;
    returnsExpected: number;
    ordersAwaitingFulfilment: number;
  };
  recentActivity: DashboardActivityItem[];
  generatedAt: string;
}

interface TimeframeParams {
  timeframe: "all_time" | "year" | "month";
  year?: number;
  month?: number;
}

interface TopListParams extends TimeframeParams {
  limit?: number;
}

function buildTimeframeParams(params: TimeframeParams): string {
  const searchParams = new URLSearchParams();
  searchParams.append("timeframe", params.timeframe);
  if (params.year) {
    searchParams.append("year", params.year.toString());
  }
  if (params.month) {
    searchParams.append("month", params.month.toString());
  }
  return searchParams.toString();
}

export const analyticsApi = {
  getDashboardOverview: () =>
    apiFetch<{ success: true; data: DashboardOverview }>(
      `/api/admin/analytics/dashboard-overview`,
    ),

  getStats: (params: TimeframeParams) =>
    apiFetch<{ success: true; data: AnalyticsStats }>(
      `/api/admin/analytics/stats?${buildTimeframeParams(params)}`,
    ),

  getRentalsRevenueTrend: (params: TimeframeParams) =>
    apiFetch<{
      success: true;
      data: { trend: TrendData[]; timeframe: string };
    }>(
      `/api/admin/analytics/rentals-revenue-trend?${buildTimeframeParams(params)}`,
    ),

  getCategoryBreakdown: (params: TimeframeParams) =>
    apiFetch<{
      success: true;
      data: CategoryBreakdown[];
    }>(
      `/api/admin/analytics/category-breakdown?${buildTimeframeParams(params)}`,
    ),

  getRevenueByCategory: (params: TimeframeParams) =>
    apiFetch<{
      success: true;
      data: {
        revenue: RevenueByCategory[];
        totalRevenue: number;
        timeframe: string;
      };
    }>(
      `/api/admin/analytics/revenue-by-category?${buildTimeframeParams(params)}`,
    ),

  getTopCurators: (params: TopListParams) =>
    apiFetch<{ success: true; data: TopCurator[] }>(
      `/api/admin/analytics/top-curators?${buildTimeframeParams(params)}&limit=${params.limit ?? 5}`,
    ),

  getTopItems: (params: TopListParams) =>
    apiFetch<{ success: true; data: TopItem[] }>(
      `/api/admin/analytics/top-items?${buildTimeframeParams(params)}&limit=${params.limit ?? 5}`,
    ),
};
