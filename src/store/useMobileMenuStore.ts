import { create } from "zustand";

type MobileMenuStore = {
  isOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
};

export const useMobileMenuStore = create<MobileMenuStore>((set) => ({
  isOpen: false,
  openMenu: () => set({ isOpen: true }),
  closeMenu: () => set({ isOpen: false }),
}));
