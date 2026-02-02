// lib/stores/profileStore.ts (no change, already correct)
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FullProfile } from "@/types/profile";

type ProfileState = {
  profile: any;
  setProfile: (profile: FullProfile) => void;
  clearProfile: () => void;
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
      clearProfile: () => set({ profile: null }),
    }),
    { name: "profile-store" },
  ),
);
