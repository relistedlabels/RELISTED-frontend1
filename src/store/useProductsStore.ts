import { create } from "zustand";

export type Filters = {
  search: string;
  gender: string;
  categories: string[];
  brands: string[];
  sizes: string;
  priceRange: [number, number];
};

type ProductsStore = {
  products: any[]; // Replace with proper Product type
  filteredProducts: any[];
  loading: boolean;
  error: string | null;
  filters: Filters;
  setProducts: (products: any[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearch: (search: string) => void;
  setGender: (gender: string) => void;
  setCategories: (categories: string[]) => void;
  setBrands: (brands: string[]) => void;
  setSizes: (sizes: string) => void;
  setPriceRange: (priceRange: [number, number]) => void;
  applyFilters: () => void;
  clearFilters: () => void;
};

const initialFilters: Filters = {
  search: "",
  gender: "",
  categories: [],
  brands: [],
  sizes: "",
  priceRange: [0, 1000000], // Adjust based on your price range
};

export const useProductsStore = create<ProductsStore>((set, get) => ({
  products: [],
  filteredProducts: [],
  loading: false,
  error: null,
  filters: initialFilters,

  setProducts: (products) => set({ products, filteredProducts: products }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  setSearch: (search) =>
    set((state) => ({ filters: { ...state.filters, search } })),

  setGender: (gender) =>
    set((state) => ({ filters: { ...state.filters, gender } })),

  setCategories: (categories) =>
    set((state) => ({ filters: { ...state.filters, categories } })),

  setBrands: (brands) =>
    set((state) => ({ filters: { ...state.filters, brands } })),

  setSizes: (sizes) =>
    set((state) => ({ filters: { ...state.filters, sizes } })),

  setPriceRange: (priceRange) =>
    set((state) => ({ filters: { ...state.filters, priceRange } })),

  applyFilters: () => {
    // Since filtering is done via API, this can be a no-op or trigger refetch if needed
    // For now, the query will automatically refetch when filters change
  },

  clearFilters: () =>
    set((state) => ({
      filters: initialFilters,
    })),
}));
