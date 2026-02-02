import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface DevAuthState {
  isAuthorized: boolean;
  authorize: () => void;
  logout: () => void;
}

export const useDevAuthStore = create<DevAuthState>()(
  persist(
    (set) => ({
      isAuthorized: false,

      authorize: () => {
        document.cookie = "dev_auth=true; path=/";
        set({ isAuthorized: true });
      },

      logout: () => {
        document.cookie = "dev_auth=; path=/; max-age=0";
        set({ isAuthorized: false });
      },
    }),
    {
      name: "dev-auth-store",
    },
  ),
);
