import { useQueryClient, useMutation } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";

export const useRemoveRentalRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) =>
      rentersApi.removeRentalRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["renters", "rental-requests"],
      });
    },
  });
};
