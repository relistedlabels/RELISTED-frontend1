import { useQuery } from "@tanstack/react-query";
import { newsletterApi } from "@/lib/api/newsletter";

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
  isActive: boolean;
}

export const useNewsletterSubscribers = (
  page: number = 1,
  limit: number = 20,
  search?: string,
) => {
  return useQuery({
    queryKey: ["admin", "newsletter", "subscribers", page, limit, search],
    queryFn: async () => {
      const response = await newsletterApi.getSubscribers({
        page,
        limit,
        search,
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};
