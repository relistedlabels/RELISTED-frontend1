import { useMutation, useQueryClient } from "@tanstack/react-query";
import { confirmReturnReceipt } from "@/lib/api/listers";

interface ConfirmReturnReceiptParams {
  orderId: string;
  actualCondition: "GOOD" | "FAIR" | "POOR";
  damageNotes?: string;
  images?: string[];
}

export const useConfirmReturnReceipt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: ConfirmReturnReceiptParams) => {
      const {
        orderId,
        actualCondition,
        damageNotes = "",
        images = [],
      } = params;

      const response = await confirmReturnReceipt(orderId, {
        actualCondition,
        damageNotes,
        images,
      });

      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ["listers", "orders", variables.orderId],
      });
      queryClient.invalidateQueries({
        queryKey: ["listers", "orders"],
      });
    },
  });
};
