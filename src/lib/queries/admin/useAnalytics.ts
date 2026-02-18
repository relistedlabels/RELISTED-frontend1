import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api/admin/";

interface TimeframeParams {
  timeframe: "all_time" | "year" | "month";
  year?: number;
  month?: number;
}

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

export const useTopCurators = (limit: number = 5) =>
  useQuery({
    queryKey: ["admin", "analytics", "top", "curators", limit],
    queryFn: () => analyticsApi.getTopCurators(limit),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

export const useTopItems = (limit: number = 5) =>
  useQuery({
    queryKey: ["admin", "analytics", "top", "items", limit],
    queryFn: () => analyticsApi.getTopItems(limit),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
