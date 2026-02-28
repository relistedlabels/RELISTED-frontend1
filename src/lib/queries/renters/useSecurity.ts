import { useMutation } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";

export const useChangePassword = () =>
  useMutation({
    mutationFn: rentersApi.changePassword,
  });
