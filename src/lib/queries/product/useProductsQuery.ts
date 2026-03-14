import { useQuery } from "@tanstack/react-query";
import { productApi } from "@/lib/api/product";
import { useSearchParams } from "next/navigation";

export const useProductsQuery = () => {
  const searchParams = useSearchParams();

  // Parse URL parameters
  const search = searchParams.get("search") || undefined;
  const gender = searchParams.get("gender") || undefined;
  const category = searchParams.get("category") || undefined;
  const categories = category ? [category] : searchParams.getAll("categories");
  const brands = searchParams.getAll("brands");
  const sizes = searchParams.get("sizes") || undefined;
  const priceMin = searchParams.get("priceMin")
    ? parseInt(searchParams.get("priceMin")!)
    : undefined;
  const priceMax = searchParams.get("priceMax")
    ? parseInt(searchParams.get("priceMax")!)
    : undefined;
  const page = searchParams.get("page")
    ? parseInt(searchParams.get("page")!)
    : 1;

  const query = useQuery<any, Error, { products: any[]; pagination?: any }>({
    queryKey: [
      "products",
      { search, gender, categories, brands, sizes, priceMin, priceMax, page },
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
        page,
        limit: 12,
      });

      // Filter products with status "APPROVED" or "AVAILABLE"
      const filteredProducts = response.data.products.filter(
        (product) =>
          product.status === "APPROVED" || product.status === "AVAILABLE",
      );

      return {
        products: filteredProducts,
        pagination: response.data.pagination,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  return query;
};
