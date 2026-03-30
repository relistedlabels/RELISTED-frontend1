import { create } from "zustand";

interface SessionState {
  isSessionExpired: boolean;
  setSessionExpired: (expired: boolean) => void;
  pendingSignInReturnUrl: string | null;
  requestSignInRedirect: (returnUrl: string) => void;
  clearPendingSignInRedirect: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  isSessionExpired: false,
  pendingSignInReturnUrl: null,

  setSessionExpired: (expired: boolean) => set({ isSessionExpired: expired }),

  requestSignInRedirect: (returnUrl) =>
    set((s) => ({
      pendingSignInReturnUrl: s.pendingSignInReturnUrl ?? returnUrl,
    })),

  clearPendingSignInRedirect: () => set({ pendingSignInReturnUrl: null }),
}));
