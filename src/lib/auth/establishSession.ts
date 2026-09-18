import { useUserStore } from "@/store/useUserStore";
import { useSessionStore } from "@/store/useSessionStore";

type AuthPayload = {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
};

/** Persist JWT in cookie + zustand after password or magic-link login. */
export async function establishSession(data: AuthPayload) {
  useSessionStore.getState().setSessionExpired(false);

  await fetch("/api/auth/set-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: data.token,
      userRole: data.user.role,
    }),
  });

  useUserStore.getState().setAuth({
    token: data.token,
    userId: data.user.id,
    email: data.user.email,
    role: data.user.role,
    name: data.user.name,
  });
}
