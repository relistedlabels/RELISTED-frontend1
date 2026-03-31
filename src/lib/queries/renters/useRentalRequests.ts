import { useQuery } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";
import { useUserStore } from "@/store/useUserStore";

export const useRentalRequests = (
  status?: "pending" | "approved" | "rejected" | "expired" | "all",
  page?: number,
  limit?: number,
  options?: Record<string, unknown>,
) => {
  const token = useUserStore((s) => s.token);
  const shouldFetch = token !== null;

  return useQuery({
    queryKey: ["renters", "rental-requests", status, page, limit],
    queryFn: async () => {
      const response = await rentersApi.getRentalRequests({
        status: status || "pending",
        page: page || 1,
        limit: limit || 20,
      });
      return response.data;
    },
    ...options,
    enabled: shouldFetch,
    staleTime: 30 * 1000,
    retry: 1,
  });
};
