import { useMutation, useQueryClient } from "@tanstack/react-query";
import { newsletterApi } from "@/lib/api/newsletter";

export const useNewsletterUnsubscribe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (email: string) => newsletterApi.unsubscribe({ email }),
    onSuccess: () => {
      // Invalidate subscribers list after unsubscribe
      queryClient.invalidateQueries({
        queryKey: ["admin", "newsletter", "subscribers"],
      });
    },
  });
};
