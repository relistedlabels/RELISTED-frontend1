import { useQuery } from "@tanstack/react-query";
import { publicApi } from "@/lib/api/public";

export const usePublicUserById = (userId: string) =>
  useQuery({
    queryKey: ["public-user", userId],
    queryFn: async () => {
      const response = await publicApi.getUserById(userId);
      return response.data.user;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    enabled: !!userId,
  });
