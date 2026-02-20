import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/lib/api/user";

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => userApi.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "all"] });
    },
  });
};
