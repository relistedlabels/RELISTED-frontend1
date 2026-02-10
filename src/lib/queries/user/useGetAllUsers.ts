import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/lib/api/user";

export const useGetAllUsers = () =>
  useQuery({
    queryKey: ["users", "all"],
    queryFn: async () => {
      const response = await userApi.getAllUsers(1, 100);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
