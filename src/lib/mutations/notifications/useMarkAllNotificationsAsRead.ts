import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  markAllNotificationsAsRead,
  NOTIFICATION_DEFAULT_DAYS,
} from "@/lib/api/notifications";

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllNotificationsAsRead(NOTIFICATION_DEFAULT_DAYS),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
