import { create } from "zustand";
import type { Product } from "@/lib/queries/product/useGetProductById";

type ProductDetailsStore = {
  product: Product | null;
  setProduct: (product: Product) => void;
  reset: () => void;
};

export const useProductDetailsStore = create<ProductDetailsStore>((set) => ({
  product: null,
  setProduct: (product) => set({ product }),
  reset: () => set({ product: null }),
}));
