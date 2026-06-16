// ENDPOINTS: GET /api/public/products

"use client";

import ProductCard from "@/common/ui/ProductCard";
import { Header1Plus, Paragraph1 } from "@/common/ui/Text";
import Filters from "../components/Filters";
import { primaryProductHeroImage } from "@/lib/product/primaryProductHeroImage";
import { useProductsQuery } from "@/lib/queries/product/useProductsQuery";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ProductCardSkeleton } from "@/common/ui/SkeletonLoaders";

export default function NewListingsSection() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const {
    data: { products: filteredProducts = [], pagination } = {},
    isLoading: loading,
    error,
  } = useProductsQuery();
  const router = useRouter();
  const searchParams = useSearchParams();

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
        <div
          className="mb-2 sm:mb-6 flex items-center justify-end gap-4"
        >
          <div className="hidden sm:flex items-center gap-4">
            <Filters />
          </div>

          <div className="sm:hidden flex items-center gap-4">
            <Filters />
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-12 text-center">
            <Paragraph1 className="text-gray-600">
              No products found matching your criteria.
            </Paragraph1>
          </div>
        ) : (
          <>
            <div className="gap-2 sm:gap-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {filteredProducts.map((product: any) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  image={primaryProductHeroImage(product)}
                  brand={product.brand?.name || ""}
                  name={product.name}
                  price={`₦${product.originalValue.toLocaleString()}`}
                  dailyPrice={product.dailyPrice}
                  resalePrice={product.resalePrice}
                  listingType={product.listingType}
                  size={product.measurement}
                  closetOwner={product.closet?.name}
                  closetImage={product.closet?.imageUrl ?? undefined}
                  isSold={product.status === "SOLD"}
                  isRentedOut={product.status === "RENTED"}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <>
                {/* Mobile: compact controls that fit narrow viewports */}
                <div className="flex sm:hidden justify-between items-center gap-2 mt-8 w-full max-w-full">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrevious}
                    className="hover:bg-gray-50 disabled:opacity-50 shrink-0 px-3 py-2 border border-gray-300 rounded text-sm disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-2 py-2 text-gray-600 text-sm text-center">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNext}
                    className="hover:bg-gray-50 disabled:opacity-50 shrink-0 px-3 py-2 border border-gray-300 rounded text-sm disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>

                {/* Desktop: ellipsis pagination for many pages */}
                <div className="hidden sm:flex justify-center items-center flex-wrap gap-2 mt-8 w-full max-w-full">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrevious}
                    className="hover:bg-gray-50 disabled:opacity-50 px-4 py-2 border border-gray-300 rounded disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  <div className="flex flex-wrap justify-center items-center gap-1">
                    {Array.from(
                      { length: pagination.totalPages },
                      (_, index) => index + 1,
                    ).map((pageNum) => {
                      const showPage =
                        pageNum === 1 ||
                        pageNum === pagination.totalPages ||
                        Math.abs(pageNum - pagination.page) <= 1;

                      if (!showPage) {
                        if (
                          pageNum === 2 &&
                          pagination.page > 3
                        ) {
                          return (
                            <span
                              key="ellipsis-start"
                              className="px-2 py-2 text-gray-500"
                            >
                              ...
                            </span>
                          );
                        }
                        if (
                          pageNum === pagination.totalPages - 1 &&
                          pagination.page < pagination.totalPages - 2
                        ) {
                          return (
                            <span
                              key="ellipsis-end"
                              className="px-2 py-2 text-gray-500"
                            >
                              ...
                            </span>
                          );
                        }
                        return null;
                      }

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
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNext}
                    className="hover:bg-gray-50 disabled:opacity-50 px-4 py-2 border border-gray-300 rounded disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}
