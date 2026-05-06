import { useMutation, useQueryClient } from "@tanstack/react-query";
import { closetApi } from "@/lib/api/closet";

export const useUpdateCloset = (closetId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      body: Partial<{
        name: string;
        slug: string;
        description: string;
        imageUrl: string;
        sortOrder: number;
        isActive: boolean;
      }>,
    ) => closetApi.update(closetId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["closets", "mine"] });
      queryClient.invalidateQueries({ queryKey: ["user-products"] });
    },
  });
};
