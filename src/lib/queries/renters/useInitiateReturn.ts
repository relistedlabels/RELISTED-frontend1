import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";

interface ReadyToReturnParams {
  orderId: string;
  conditionImages: File[];
  damageNotes?: string;
  itemCondition?: "good" | "fair" | "poor";
}

export const useInitiateReturn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: ReadyToReturnParams) => {
      const {
        orderId,
        conditionImages,
        damageNotes = "",
        itemCondition = "good",
      } = params;

      // Create FormData with all images and condition data
      const formData = new FormData();

      // Append all image files
      conditionImages.forEach((file) => {
        formData.append("images", file);
      });

      // Append condition and notes
      formData.append("itemCondition", itemCondition);
      if (damageNotes) {
        formData.append("damageNotes", damageNotes);
      }

      // Send everything in one request to the unified endpoint
      const response = await rentersApi.readyToReturn(orderId, formData);

      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ["renters", "orders", variables.orderId],
      });
      queryClient.invalidateQueries({
        queryKey: ["renters", "orders", variables.orderId, "progress"],
      });
      queryClient.invalidateQueries({
        queryKey: ["renters", "orders"],
      });
    },
  });
};
