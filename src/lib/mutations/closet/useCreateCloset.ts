import { useMutation, useQueryClient } from "@tanstack/react-query";
import { closetApi } from "@/lib/api/closet";

export const useCreateCloset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      name: string;
      slug?: string;
      description?: string;
      imageUrl?: string;
      sortOrder?: number;
    }) => closetApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["closets", "mine"] });
      queryClient.invalidateQueries({ queryKey: ["user-products"] });
    },
  });
};
