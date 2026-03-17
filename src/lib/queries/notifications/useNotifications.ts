import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getNotifications } from "@/lib/api/notifications";

export const useNotifications = () => {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await getNotifications();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

export const useNotificationsQueryClient = () => {
  return useQueryClient();
};
