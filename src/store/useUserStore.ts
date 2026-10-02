// store/useUserStore.ts
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type UserState = {
  token: string | null;
  userId: string | null;
  name: string | null;
  email: string | null;
  role: string | null;
  sessionToken: string | null;
  requiresMfa: boolean;

  setUser: (user: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  }) => void;

  setAuth: (data: {
    token: string;
    userId: string;
    email: string;
    role: string;
    name: string;
  }) => void;

  setMfaSession: (data: { sessionToken: string; email: string }) => void;

  clearUser: () => Promise<void>;
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      token: null,
      userId: null,
      name: null,
      email: null,
      role: null,
      sessionToken: null,
      requiresMfa: false,

      setUser: (user) =>
        set((state) => ({
          ...state,
          ...user,
        })),

      setAuth: ({ token, userId, email, role, name }) =>
        set({
          token,
          userId,
          email,
          role,
          name,
          sessionToken: null,
          requiresMfa: false,
        }),

      setMfaSession: ({ sessionToken, email }) =>
        set({
          sessionToken,
          email,
          requiresMfa: true,
        }),

      clearUser: async () => {
        // Clear cookies on the server
        set({
          token: null,
          userId: null,
          name: null,
          email: null,
          role: null,
          sessionToken: null,
          requiresMfa: false,
        });

        try {
          const response = await fetch("/api/auth/clear-token", {
            method: "POST",
          });
          if (!response.ok) {
            console.error(
              "Failed to clear token cookie:",
              response.status,
              response.statusText,
            );
          }
        } catch (err) {
          console.error("Failed to clear token cookie:", err);
        }
      },
    }),
    {
      name: "user-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        userId: state.userId,
        name: state.name,
        email: state.email,
        role: state.role,
        sessionToken: state.sessionToken,
        requiresMfa: state.requiresMfa,
      }),
    },
  ),
);
