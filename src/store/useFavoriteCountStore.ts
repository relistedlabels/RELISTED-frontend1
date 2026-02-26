// store/useFavoriteCountStore.ts
import { create } from "zustand";

type FavoriteCountState = {
  favoriteCount: number;
  setFavoriteCount: (count: number) => void;
  incrementFavoriteCount: () => void;
  decrementFavoriteCount: () => void;
  reset: () => void;
};

export const useFavoriteCountStore = create<FavoriteCountState>((set) => ({
  favoriteCount: 0,

  setFavoriteCount: (count) => set({ favoriteCount: count }),

  incrementFavoriteCount: () =>
    set((state) => ({ favoriteCount: state.favoriteCount + 1 })),

  decrementFavoriteCount: () =>
    set((state) => ({
      favoriteCount: Math.max(0, state.favoriteCount - 1),
    })),

  reset: () => set({ favoriteCount: 0 }),
}));
