// ENDPOINTS: GET /api/public/products

"use client";

import ProductCard from "@/common/ui/ProductCard";
import { Header1Plus, Paragraph1 } from "@/common/ui/Text";
import Filters from "../components/Filters";
import { useProductsQuery } from "@/lib/queries/product/useProductsQuery";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ProductCardSkeleton } from "@/common/ui/SkeletonLoaders";
import { CheckCircle } from "lucide-react";

export default function NewListingsSection() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const {
    data: { products: filteredProducts = [], pagination } = {},
    isLoading: loading,
    error,
    refetch,
  } = useProductsQuery();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check if running on localhost
  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.startsWith("localhost:"));

  // Filter out test curator products on production
  const HIDDEN_CURATOR_ID = "7d172d18-daad-46cd-ab6d-8d8af28c0b16";
  const visibleProducts = filteredProducts.filter((product: any) => {
    if (!isLocalhost && product.curatorId === HIDDEN_CURATOR_ID) {
      return false;
    }
    return true;
  });

  const handleSearchChange = (search: string) => {
    const params = new URLSearchParams(searchParams);
    if (search) {
      params.set("search", search);
      params.set("page", "1");
    } else {
      params.delete("search");
      params.set("page", "1");
    }
    router.push(`?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  if (loading) {
    return (
      <section className="bg-white px-4 md:px-10 py-4 sm:py-10 w-full">
        <div className="mx-auto container">
          <div className="mb-2 sm:mb-6 text-center">
            <Header1Plus className="flex-1 font-light sm:text-center">
              Available Listings
            </Header1Plus>
            <Paragraph1 className="mt-4 text-gray-600">
              Loading products...
            </Paragraph1>
          </div>
          <ProductCardSkeleton count={15} />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-white px-4 md:px-0 py-4 sm:pb-10 w-full">
        <div className="mx-auto container">
          <div className="mb-2 sm:mb-6 text-center">
            <Header1Plus className="flex-1 font-light sm:text-center">
              Available Listings
            </Header1Plus>
          </div>
          <ProductCardSkeleton count={15} />
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white px-4 md:px-10 py-4 w-full">
      <div className="mx-auto container">
        {/* Top Bar */}
        <div className="flex justify-between items-center gap-4 mb-2 sm:mb-6">
          {/* Left Controls */}
          <div className="hidden sm:flex items-center gap-4">
            <Filters />
          </div>

          <div className="sm:hidden flex items-center gap-4">
            <Filters />
          </div>

          {/* Search */}
          <CheckCircle />
          <div className="hidden sm:flex- w-full md:w-[200px]">
            <input
              type="text"
              placeholder="Search"
              onChange={(e) => handleSearchChange(e.target.value)}
              className="px-4 py-2 border focus:outline-none w-full text-sm"
            />
          </div>
        </div>

        {/* Product Grid */}
        {visibleProducts.length === 0 ? (
          <div className="py-12 text-center">
            <Paragraph1 className="text-gray-600">
              No products found matching your criteria.
            </Paragraph1>
          </div>
        ) : (
          <>
            <div className="gap-2 sm:gap-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {visibleProducts.map((product: any) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  image={
                    product.attachments?.uploads?.[0]?.url || "/placeholder.jpg"
                  }
                  brand={product.brand?.name || ""}
                  name={product.name}
                  price={`₦${product.originalValue.toLocaleString()}`}
                  dailyPrice={product.dailyPrice}
                  resalePrice={product.resalePrice}
                  listingType={product.listingType}
                  size={product.measurement}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrevious}
                  className="hover:bg-gray-50 disabled:opacity-50 px-4 py-2 border border-gray-300 rounded disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {/* Page Numbers */}
                {Array.from({ length: pagination.totalPages }).map(
                  (_, index) => {
                    const pageNum = index + 1;
                    const isActive = pageNum === pagination.page;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 rounded border ${
                          isActive
                            ? "bg-black text-white border-black"
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  },
                )}

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                  className="hover:bg-gray-50 disabled:opacity-50 px-4 py-2 border border-gray-300 rounded disabled:cursor-not-allowed"
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
