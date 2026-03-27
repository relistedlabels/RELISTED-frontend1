import { useQuery } from "@tanstack/react-query";
import { publicApi, type PublicUsersResponse } from "@/lib/api/public";

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
      return {
        users: response.data,
        pagination: response.pagination,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
