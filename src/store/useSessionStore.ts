import { create } from "zustand";

interface SessionState {
  isSessionExpired: boolean;
  setSessionExpired: (expired: boolean) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  isSessionExpired: false,
  setSessionExpired: (expired: boolean) => set({ isSessionExpired: expired }),
}));
