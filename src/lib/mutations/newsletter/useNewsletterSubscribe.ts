import { useMutation } from "@tanstack/react-query";
import { newsletterApi } from "@/lib/api/newsletter";

export const useNewsletterSubscribe = () => {
  return useMutation({
    mutationFn: (email: string) => newsletterApi.subscribe({ email }),
  });
};
