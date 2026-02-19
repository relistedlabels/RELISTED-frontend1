// ENDPOINTS: GET /api/renters/favorites, POST /api/renters/favorites/:itemId, DELETE /api/renters/favorites/:itemId

"use client";

import { useState, useMemo } from "react";
import { useFavorites } from "@/lib/queries/renters/useFavorites";
import { useRemoveFavorite } from "@/lib/mutations/renters/useFavoriteMutations";
import ProductCard from "@/common/ui/ProductCard";
import { Header1Plus, Paragraph1 } from "@/common/ui/Text";
import { SlidersVertical, Heart } from "lucide-react";
import Button from "@/common/ui/Button";

// Skeleton Loader
const FavoriteCardSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
    <div className="w-full h-64 bg-gray-200"></div>
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-20"></div>
      <div className="h-5 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-24"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
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

  // Filter by search
  const filteredItems = useMemo(() => {
    if (!data?.favorites) return [];
    return data.favorites.filter(
      (item) =>
        item.itemName.toLowerCase().includes(search.toLowerCase()) ||
        item.listerName.toLowerCase().includes(search.toLowerCase()),
    );
  }, [data?.favorites, search]);

  const handleRemoveFavorite = (itemId: string) => {
    removeFavorite.mutate(itemId);
  };

  if (isLoading) {
    return (
      <section className="w-full">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
        <div className="container mx-auto">
          <div className="text-center py-12">
            <Paragraph1 className="text-red-500">
              Failed to load favorites. Please try again.
            </Paragraph1>
          </div>
        </div>
      </section>
    );
  }

  if (!data?.favorites || data.favorites.length === 0) {
    return (
      <section className="w-full">
        <div className="container mx-auto">
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
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
      <div className="container mx-auto">
        {/* Search and Filter Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1 w-full">
            <input
              type="text"
              placeholder="Search favorites by name or lister..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
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
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div key={item.id} className="relative">
                <ProductCard
                  image={item.image}
                  brand={item.listerName}
                  name={item.itemName}
                  price={`₦${item.rentalPrice.toLocaleString()}`}
                />
                {/* Remove from Favorites Button */}
                <button
                  onClick={() => handleRemoveFavorite(item.itemId)}
                  disabled={removeFavorite.isPending}
                  className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition disabled:opacity-50"
                  aria-label="Remove from favorites"
                  title="Remove from favorites"
                >
                  <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
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
              Showing {filteredItems.length} of {data.totalFavorites} favorites
            </Paragraph1>
          </div>
        )}
      </div>
    </section>
  );
}
