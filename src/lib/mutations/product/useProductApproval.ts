import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productApi } from "@/lib/api/product";

/**
 * Approve a product - changes status to APPROVED and sets productVerified to true
 */
export const useApproveProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => productApi.approveProduct(productId),
    onSuccess: () => {
      // Invalidate admin statistics query
      queryClient.invalidateQueries({ queryKey: ["product", "statistics"] });
    },
  });
};

/**
 * Reject a product - changes status to REJECTED and stores rejection comment
 */
export const useRejectProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      rejectionComment,
    }: {
      productId: string;
      rejectionComment: string;
    }) => productApi.rejectProduct(productId, rejectionComment),
    onSuccess: () => {
      // Invalidate admin statistics query
      queryClient.invalidateQueries({ queryKey: ["product", "statistics"] });
    },
  });
};
