// store/useUserStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type UserState = {
  token: string | null;
  userId: string | null;
  name: string | null;
  email: string | null;
  role: string | null;

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

  clearUser: () => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      token: null,
      userId: null,
      name: null,
      email: null,
      role: null,

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
        }),

      clearUser: () =>
        set({
          token: null,
          userId: null,
          name: null,
          email: null,
          role: null,
        }),
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
      }),
    },
  ),
);
