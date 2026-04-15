// ENDPOINTS: GET /api/renters/favorites, POST /api/renters/favorites/:itemId, DELETE /api/renters/favorites/:itemId

"use client";

import { useState, useMemo } from "react";
import { useFavorites } from "@/lib/queries/renters/useFavorites";
import { useRemoveFavorite } from "@/lib/mutations/renters/useFavoriteMutations";
import ProductCard from "@/common/ui/ProductCard";
import { useGetProductById } from "@/lib/queries/product/useGetProductById";
import { useQueries } from "@tanstack/react-query";
import { fetchProductById } from "@/lib/queries/product/useGetProductById";
import { Header1Plus, Paragraph1 } from "@/common/ui/Text";
import { SlidersVertical, Heart } from "lucide-react";
import Button from "@/common/ui/Button";

// Custom hook to batch fetch favorite products by IDs
function useFavoriteProducts(productIds: string[]) {
  const queries = useQueries({
    queries: productIds.map((id) => ({
      queryKey: ["product", id],
      queryFn: () => fetchProductById(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    })),
  });

  return queries.map((q) => q.data).filter(Boolean);
}

// Skeleton Loader
const FavoriteCardSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
    <div className="bg-gray-200 w-full h-64"></div>
    <div className="space-y-3 p-4">
      <div className="bg-gray-200 rounded w-20 h-4"></div>
      <div className="bg-gray-200 rounded w-full h-5"></div>
      <div className="bg-gray-200 rounded w-24 h-4"></div>
      <div className="bg-gray-200 rounded h-10"></div>
    </div>
  </div>
);

export default function Favorites() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<
    "newest" | "oldest" | "price_low" | "price_high"
  >("newest");

  const { data, isLoading, error } = useFavorites(page, 20, sort);
  const removeFavorite = useRemoveFavorite();

  // Get all favorite product IDs
  const favoriteProductIds = useMemo(() => {
    if (!data?.favorites) return [];
    return data.favorites.map((item) => item.productId);
  }, [data?.favorites]);

  // Use custom hook to batch fetch products
  const favoriteProducts = useFavoriteProducts(favoriteProductIds);

  // Filter by search (on product name or brand)
  // NOTE: Since 'Product' only has 'brandId', you need to fetch brand names separately.
  // For now, filter only by product name. If you want to filter by brand, fetch brand info for each product.
  const filteredProducts = useMemo(() => {
    if (!favoriteProducts.length) return [];
    return favoriteProducts.filter(
      (product) =>
        product && product.name?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [favoriteProducts, search]);

  const handleRemoveFavorite = (itemId: string) => {
    removeFavorite.mutate(itemId);
  };

  if (isLoading) {
    return (
      <section className="w-full">
        <div className="mx-auto container">
          <div className="gap-4 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(12)].map((_, i) => (
              <FavoriteCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full">
        <div className="mx-auto container">
          <div className="py-12 text-center">
            <Paragraph1 className="text-red-500">
              Failed to load favorites. Please try again.
            </Paragraph1>
          </div>
        </div>
      </section>
    );
  }

  if (!favoriteProducts.length) {
    return (
      <section className="w-full">
        <div className="mx-auto container">
          <div className="py-12 text-center">
            <Heart className="mx-auto mb-4 w-16 h-16 text-gray-300" />
            <Paragraph1 className="text-gray-600">
              No favorites yet. Start adding items you love!
            </Paragraph1>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full">
      <div className="mx-auto container">
        {/* Search and Filter Bar */}
        <div className="flex sm:flex-row flex-col items-start sm:items-center gap-4 mb-6">
          <div className="flex-1 w-full">
            <input
              type="text"
              placeholder="Search favorites by name or lister..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black w-full"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="gap-4 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) =>
              product ? (
                <div key={product.id} className="relative">
                  <ProductCard
                    id={product.id}
                    image={product.attachments?.uploads?.[0]?.url || ""}
                    brand={product.brand?.name || ""}
                    name={product.name}
                    price={`₦${product?.originalValue?.toLocaleString() || "0"}`}
                    dailyPrice={product.dailyPrice}
                    resalePrice={product.resalePrice}
                    listingType={product.listingType}
                    size={product.measurement}
                  />
                  {/* Remove from Favorites Button */}
                  <button
                    onClick={() => handleRemoveFavorite(product.id)}
                    disabled={removeFavorite.isPending}
                    className="top-4 right-4 absolute bg-white hover:bg-red-50 disabled:opacity-50 shadow-lg p-2 rounded-full transition"
                    aria-label="Remove from favorites"
                    title="Remove from favorites"
                  >
                    <Heart className="fill-red-500 w-5 h-5 text-red-500" />
                  </button>
                </div>
              ) : null,
            )
          ) : (
            <div className="col-span-full py-12 text-center">
              <Paragraph1 className="text-gray-600">
                No items match your search.
              </Paragraph1>
            </div>
          )}
        </div>

        {/* Pagination Info */}
        {data && (
          <div className="mt-6 text-center">
            <Paragraph1 className="text-gray-600">
              Showing {filteredProducts.length} of {data.totalFavorites}{" "}
              favorites
            </Paragraph1>
          </div>
        )}
      </div>
    </section>
  );
}
