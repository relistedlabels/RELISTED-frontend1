import { useQuery } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";

export const useRentalRequests = (
  status?: "pending" | "approved" | "rejected" | "expired" | "all",
  page?: number,
  limit?: number,
) =>
  useQuery({
    queryKey: ["renters", "rental-requests", status, page, limit],
    queryFn: async () => {
      const response = await rentersApi.getRentalRequests({
        status: status || "pending",
        page: page || 1,
        limit: limit || 20,
      });
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds - short cache since items are expiring
    retry: 1,
    refetchInterval: 5 * 1000, // Poll every 5 seconds for cart updates
  });
