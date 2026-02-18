import { useQuery } from "@tanstack/react-query";
import { publicApi } from "@/lib/api/public";

export const useUsers = (params?: {
  page?: number;
  limit?: number;
  sort?: "rating" | "newest" | "popularity";
  search?: string;
  role?: "lister" | "renter";
}) =>
  useQuery({
    queryKey: ["users", params],
    queryFn: async () => {
      const response = await publicApi.getUsers(params);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
