import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/http";

export interface RentalRecord {
  id: string;
  dresserName: string;
  dresserImage: string;
  duration: string;
  dateRange: string;
  status: "Completed" | "Pending Return" | "In Transit" | "Cancelled";
  total: string;
}

interface RentalHistoryResponse {
  success: true;
  data: {
    rentals: RentalRecord[];
    total: number;
    page: number;
    limit: number;
  };
}

/**
 * Fetch rental history for a specific user/lister
 * GET /api/admin/users/:userId/rentals
 */
export const useRentalHistory = (
  userId: string,
  page: number = 1,
  limit: number = 20,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: ["admin", "user", userId, "rentals", { page, limit }],
    queryFn: () =>
      apiFetch<RentalHistoryResponse>(
        `/api/admin/users/${userId}/rentals?page=${page}&limit=${limit}`,
      ),
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
