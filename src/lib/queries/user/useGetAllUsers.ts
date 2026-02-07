import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/lib/api/user";

export const useGetAllUsers = (page: number = 1, count: number = 10) =>
  useQuery({
    queryKey: ["users", "all", { page, count }],
    queryFn: async () => {
      const response = await userApi.getAllUsers(page, count);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
