import { create } from "zustand";
import { persist } from "zustand/middleware";

type ProductCardData = {
  id: string;
  image: string;
  brand: string;
  name: string;
  price: string;
  dailyPrice?: number;
};

type BrowseStore = {
  recentSearches: string[];
  recentlyViewed: ProductCardData[];

  addSearch: (term: string) => void;
  clearSearches: () => void;

  addViewed: (product: ProductCardData) => void;
};

export const useBrowseStore = create<BrowseStore>()(
  persist(
    (set, get) => ({
      recentSearches: [],
      recentlyViewed: [],

      addSearch: (term) => {
        if (!term.trim()) return;

        const current = get().recentSearches.filter(
          (t) => t.toLowerCase() !== term.toLowerCase(),
        );

        set({
          recentSearches: [term, ...current].slice(0, 5),
        });
      },

      clearSearches: () => set({ recentSearches: [] }),

      addViewed: (product) => {
        const current = get().recentlyViewed.filter((p) => p.id !== product.id);

        set({
          recentlyViewed: [product, ...current].slice(0, 3),
        });
      },
    }),
    {
      name: "browse-storage",
    },
  ),
);
