import { useQuery } from "@tanstack/react-query";
import { getAllUsers } from "@/lib/api/users";

export const useUsers = () =>
  useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await getAllUsers();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
