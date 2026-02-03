import { useQuery } from "@tanstack/react-query";
import { productApi } from "@/lib/api/product";
import { useProductsStore } from "@/store/useProductsStore";
import { useEffect } from "react";

export const useProductsQuery = () => {
  const { filters, setProducts, setLoading, setError } = useProductsStore();

  const query = useQuery({
    queryKey: ["products", filters],
    queryFn: async () => {
      const response = await productApi.getAll({
        search: filters.search || undefined,
        gender: filters.gender || undefined,
        categories:
          filters.categories.length > 0 ? filters.categories : undefined,
        brands: filters.brands.length > 0 ? filters.brands : undefined,
        sizes: filters.sizes || undefined,
        priceMin: filters.priceRange[0] > 0 ? filters.priceRange[0] : undefined,
        priceMax:
          filters.priceRange[1] < 1000000 ? filters.priceRange[1] : undefined,
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  // Update store when query state changes
  useEffect(() => {
    setLoading(query.isLoading);
    setError(query.error?.message || null);

    if (query.data) {
      setProducts(query.data);
    }
  }, [
    query.isLoading,
    query.error,
    query.data,
    setLoading,
    setError,
    setProducts,
  ]);

  return query;
};
