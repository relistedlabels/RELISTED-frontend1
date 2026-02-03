import { useMutation } from "@tanstack/react-query";
import { resendOtp } from "@/lib/api/auth";

export function useResendOtp() {
  return useMutation({
    mutationFn: resendOtp,
  });
}
