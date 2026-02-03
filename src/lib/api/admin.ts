import { apiFetch } from "./http";

export const adminApi = {
  sendOtp: () =>
    apiFetch("/admin/send-otp", {
      method: "POST",
    }),

  verifyOtp: (data: { otp: string }) =>
    apiFetch("/admin/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
};
