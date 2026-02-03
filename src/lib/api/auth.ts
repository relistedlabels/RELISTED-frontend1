import { apiFetch } from "./http";

export const signup = (data: {
  name: string;
  email: string;
  password: string;
  role: string | null;
}) =>
  apiFetch("/auth/signup", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const verifyOtp = (data: { code: string }) =>
  apiFetch("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify(data),
  });

// lib/api/auth.ts
// lib/api/auth.ts
export const login = (data: {
  email: string;
  password: string;
}): Promise<{
  success?: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
  requiresMfa?: boolean;
  sessionToken?: string;
  message?: string;
}> =>
  apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const verifyAdminMfa = (data: {
  code: string;
  sessionToken: string;
}): Promise<{
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
  message?: string;
}> =>
  apiFetch("/auth/verify-admin-mfa", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const checkDashboardSelection = (): Promise<{
  isAdmin: boolean;
  user: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}> =>
  apiFetch("/auth/check-dashboard-selection", {
    method: "GET",
  });

export const forgotPassword = (data: { email: string }) =>
  apiFetch("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const resetPassword = (data: {
  code: string;
  password: string;
  email: string;
}) =>
  apiFetch("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getMe = () =>
  apiFetch<{
    id: string;
    email: string;
    name: string;
    role: string;
    profile: { id: string };
  }>("/auth/user");

export const resendOtp = (data: { email: string }) =>
  apiFetch("/auth/resend-otp", {
    method: "POST",
    body: JSON.stringify(data),
  });
