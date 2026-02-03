import { useMutation } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";

export const useSendAdminOtpMutation = () => {
  return useMutation({
    mutationFn: adminApi.sendOtp,
  });
};

export const useVerifyAdminOtpMutation = () => {
  return useMutation({
    mutationFn: (otp: string) => adminApi.verifyOtp({ otp }),
  });
};
