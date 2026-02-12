import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateNotificationPreferences,
  UpdateNotificationPreferencesPayload,
} from "@/lib/api/listers";

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateNotificationPreferencesPayload) =>
      updateNotificationPreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["listers", "notifications", "preferences"],
      });
    },
  });
}
