// ENDPOINTS: GET /api/public/users/:userId/products

"use client";

import { useState } from "react";
import ProductCard from "@/common/ui/ProductCard";
import { Header1Plus, Paragraph1 } from "@/common/ui/Text";
import { SlidersVertical } from "lucide-react";
import Filters from "./Filters";
import { ProductCardSkeleton } from "@/common/ui/SkeletonLoaders";
import { usePublicUserProducts } from "@/lib/queries/user/usePublicUserProducts";

interface NewListingsSectionProps {
  userId: string;
}

export default function NewListingsSection({
  userId,
}: NewListingsSectionProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<
    "newest" | "price_low" | "price_high" | "rating"
  >("newest");

  const { data, isLoading, error } = usePublicUserProducts(userId, {
    page,
    limit: 20,
    sort: sortBy,
    search: search || undefined,
  });

  if (error) {
    return (
      <section className="w-full">
        <div className="container mx-auto">
          <Paragraph1 className="text-center text-red-600 py-8">
            Failed to load products. Please try again later.
          </Paragraph1>
        </div>
      </section>
    );
  }

  const products = data?.products || [];
  const pagination = data?.pagination;

  return (
    <section className="w-full ">
      <div className="container mx-auto">
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-4 mb-6">
          {/* Left Controls */}
          <div className="hidden sm:flex items-center gap-4">
            <Filters />
          </div>

          {/* Title */}
          <Header1Plus className="sm:text-center uppercase font-light flex-1">
            All Listings
          </Header1Plus>

          <div className="flex sm:hidden items-center gap-4">
            <Filters />
          </div>

          {/* Search */}
          <div className="w-full md:w-[200px] hidden sm:flex">
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1); // Reset to first page on search
              }}
              className="border w-full px-4 py-2 text-sm focus:outline-none"
            />
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <ProductCardSkeleton count={20} />
        ) : products.length === 0 ? (
          <Paragraph1 className="text-center text-gray-600 py-12">
            No products found
          </Paragraph1>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard
                  id={product.id}
                  image={product.image}
                  brand={product.brand?.name || "BRAND"}
                  name={product.name}
                  price={`₦${(product.originalValue || 0).toLocaleString()}`}
                  dailyPrice={product.dailyPrice}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-gray-600">
                  Page {page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() =>
                    setPage(Math.min(pagination.totalPages, page + 1))
                  }
                  disabled={page === pagination.totalPages}
                  className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
