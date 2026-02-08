import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/lib/api/user";

export const useGetUserById = (userId: string) =>
  useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const response = await userApi.getUserById(userId);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
    enabled: !!userId, // Don't fetch if userId is empty
  });
