import { useMutation } from "@tanstack/react-query";
import { changeListerPassword, ChangePasswordPayload } from "@/lib/api/listers";

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordPayload) => changeListerPassword(data),
  });
}
