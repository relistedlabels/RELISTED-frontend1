import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminReviewsApi } from "@/lib/api/admin/reviews";

export function useAdminReviews(params?: {
  page?: number;
  limit?: number;
  search?: string;
  visibility?: "all" | "visible" | "hidden";
}) {
  return useQuery({
    queryKey: ["admin", "reviews", params],
    queryFn: async () => {
      const response = await adminReviewsApi.list(params);
      return response.data;
    },
    staleTime: 30_000,
  });
}

export function useAdminReviewModeration() {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });

  const hide = useMutation({
    mutationFn: ({ reviewId, hidden }: { reviewId: string; hidden: boolean }) =>
      adminReviewsApi.setVisibility(reviewId, hidden),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (reviewId: string) => adminReviewsApi.remove(reviewId),
    onSuccess: invalidate,
  });

  return { hide, remove };
}
