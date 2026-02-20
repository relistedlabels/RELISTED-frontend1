import { useMutation } from "@tanstack/react-query";
import { userApi } from "@/lib/api/user";

export const useResetUserPassword = () => {
  return useMutation({
    mutationFn: ({
      userId,
      newPassword,
    }: {
      userId: string;
      newPassword: string;
    }) => userApi.resetUserPassword(userId, newPassword),
  });
};
