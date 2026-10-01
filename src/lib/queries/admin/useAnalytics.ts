import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api/admin/";

interface TimeframeParams {
  timeframe: "all_time" | "year" | "month";
  year?: number;
  month?: number;
}

export const useDashboardOverview = () =>
  useQuery({
    queryKey: ["admin", "analytics", "dashboard-overview"],
    queryFn: () => analyticsApi.getDashboardOverview(),
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    retry: 1,
  });

export const useAnalyticsStats = (params: TimeframeParams) =>
  useQuery({
    queryKey: [
      "admin",
      "analytics",
      "stats",
      params.timeframe,
      params.year,
      params.month,
    ],
    queryFn: () => analyticsApi.getStats(params),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

export const useRentalsRevenueTrend = (params: TimeframeParams) =>
  useQuery({
    queryKey: [
      "admin",
      "analytics",
      "trend",
      params.timeframe,
      params.year,
      params.month,
    ],
    queryFn: () => analyticsApi.getRentalsRevenueTrend(params),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

export const useCategoryBreakdown = (params: TimeframeParams) =>
  useQuery({
    queryKey: [
      "admin",
      "analytics",
      "categories",
      params.timeframe,
      params.year,
      params.month,
    ],
    queryFn: () => analyticsApi.getCategoryBreakdown(params),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

export const useRevenueByCategory = (params: TimeframeParams) =>
  useQuery({
    queryKey: [
      "admin",
      "analytics",
      "revenue",
      "categories",
      params.timeframe,
      params.year,
      params.month,
    ],
    queryFn: () => analyticsApi.getRevenueByCategory(params),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

export const useTopCurators = (params: TimeframeParams, limit = 5) =>
  useQuery({
    queryKey: [
      "admin",
      "analytics",
      "top",
      "curators",
      params.timeframe,
      params.year,
      params.month,
      limit,
    ],
    queryFn: () => analyticsApi.getTopCurators({ ...params, limit }),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

export const useTopItems = (params: TimeframeParams, limit = 5) =>
  useQuery({
    queryKey: [
      "admin",
      "analytics",
      "top",
      "items",
      params.timeframe,
      params.year,
      params.month,
      limit,
    ],
    queryFn: () => analyticsApi.getTopItems({ ...params, limit }),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
