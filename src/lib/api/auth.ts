import { apiFetch } from "./http";

function unwrapResponse<T>(raw: unknown): T {
  if (raw && typeof raw === "object" && "response" in raw) {
    return (raw as { response: T }).response;
  }
  return raw as T;
}

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
  }).then((raw) => {
    const payload = unwrapResponse<{
      success?: boolean;
      token?: string;
      user?: { id: string; email: string; role: string; name: string };
      requiresMfa?: boolean;
      sessionToken?: string;
      message?: string;
    }>(raw);
    return payload;
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
  }).then((raw) => {
    const payload = unwrapResponse<{
      token: string;
      user: { id: string; email: string; role: string; name: string };
      message?: string;
    }>(raw);
    return payload;
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
  }).then((raw) => unwrapResponse(raw));

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
  apiFetch("/auth/user").then((raw) => {
    const payload = unwrapResponse<{
      id?: string;
      email?: string;
      name?: string;
      role?: string;
      profile?: { id: string };
      user?: {
        id: string;
        email: string;
        name: string;
        role: string;
        profile?: { id: string };
      };
    }>(raw);

    const user = payload.user ?? payload;
    return user as {
      id: string;
      email: string;
      name: string;
      role: string;
      profile: { id: string };
    };
  });

export const resendOtp = (data: { email: string }) =>
  apiFetch("/auth/resend-otp", {
    method: "POST",
    body: JSON.stringify(data),
  }).then((raw) => unwrapResponse(raw));
