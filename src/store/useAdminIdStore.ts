import { create } from "zustand";

interface AdminIdStore {
  adminId: string | null;
  setAdminId: (id: string) => void;
  clearAdminId: () => void;
}

export const useAdminIdStore = create<AdminIdStore>((set) => ({
  adminId: null,
  setAdminId: (id: string) => set({ adminId: id }),
  clearAdminId: () => set({ adminId: null }),
}));
