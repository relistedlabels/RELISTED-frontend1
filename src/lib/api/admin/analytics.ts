import { apiFetch } from "../http";

export interface AnalyticsStats {
  totalRentals: number;
  totalRevenue: number;
  activeListings: number;
  activeDisputes: number;
  activeUsers: number;
  avgDeliveryTime: number;
  timeframe: string;
  period: string;
}

export interface TrendData {
  month: string;
  rentals: number;
  revenue: number;
}

export interface CategoryBreakdown {
  category: string;
  quantity: number;
}

export interface RevenueByCategory {
  category: string;
  percentage: number;
  amount: number;
}

export interface TopCurator {
  id: string;
  name: string;
  avatar: string;
  rentals: number;
  revenue: number;
  rating: number;
}

export interface TopItem {
  id: string;
  name: string;
  category: string;
  image: string;
  totalEarnings: number;
  rentals: number;
  rating: number;
  curator: {
    id: string;
    name: string;
  };
}

interface TimeframeParams {
  timeframe: "all_time" | "year" | "month";
  year?: number;
  month?: number;
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
      data: { breakdown: CategoryBreakdown[]; timeframe: string };
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

  getTopCurators: (limit: number = 5) =>
    apiFetch<{ success: true; data: { topCurators: TopCurator[] } }>(
      `/api/admin/analytics/top-curators?limit=${limit}`,
    ),

  getTopItems: (limit: number = 5) =>
    apiFetch<{ success: true; data: { topItems: TopItem[] } }>(
      `/api/admin/analytics/top-items?limit=${limit}`,
    ),
};
