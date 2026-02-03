import { useQuery } from "@tanstack/react-query";
import { productApi } from "@/lib/api/product";
import { useSearchParams } from "next/navigation";

export const useProductsQuery = () => {
  const searchParams = useSearchParams();

  // Parse URL parameters
  const search = searchParams.get("search") || undefined;
  const gender = searchParams.get("gender") || undefined;
  const categories = searchParams.getAll("categories");
  const brands = searchParams.getAll("brands");
  const sizes = searchParams.get("sizes") || undefined;
  const priceMin = searchParams.get("priceMin")
    ? parseInt(searchParams.get("priceMin")!)
    : undefined;
  const priceMax = searchParams.get("priceMax")
    ? parseInt(searchParams.get("priceMax")!)
    : undefined;

  const query = useQuery({
    queryKey: [
      "products",
      { search, gender, categories, brands, sizes, priceMin, priceMax },
    ],
    queryFn: async () => {
      const response = await productApi.getAll({
        search,
        gender,
        categories: categories.length > 0 ? categories : undefined,
        brands: brands.length > 0 ? brands : undefined,
        sizes,
        priceMin,
        priceMax,
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  return query;
};
