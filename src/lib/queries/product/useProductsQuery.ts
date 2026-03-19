import { useQuery } from "@tanstack/react-query";
import { productApi } from "@/lib/api/product";
import { useSearchParams } from "next/navigation";

export const useProductsQuery = () => {
  const searchParams = useSearchParams();

  // Parse URL parameters
  const search = searchParams.get("search") || undefined;
  const category = searchParams.getAll("category");
  const brand = searchParams.getAll("brand");
  const size = searchParams.get("size") || undefined;
  const minPrice = searchParams.get("minPrice")
    ? parseInt(searchParams.get("minPrice")!)
    : undefined;
  const maxPrice = searchParams.get("maxPrice")
    ? parseInt(searchParams.get("maxPrice")!)
    : undefined;
  const color = searchParams.get("color") || undefined;
  const condition = searchParams.get("condition") || undefined;
  const material = searchParams.get("material") || undefined;
  const page = searchParams.get("page")
    ? parseInt(searchParams.get("page")!)
    : 1;

  const query = useQuery<any, Error, { products: any[]; pagination?: any }>({
    queryKey: [
      "products",
      {
        search,
        category,
        brand,
        size,
        minPrice,
        maxPrice,
        color,
        condition,
        material,
        page,
      },
    ],
    queryFn: async () => {
      const response = await productApi.getAll({
        search,
        category: category.length > 0 ? category : undefined,
        brand: brand.length > 0 ? brand : undefined,
        size,
        minPrice,
        maxPrice,
        color,
        condition,
        material,
        page,
        limit: 15,
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
