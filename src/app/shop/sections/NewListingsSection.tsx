// ENDPOINTS: GET /api/public/products

"use client";

import ProductCard from "@/common/ui/ProductCard";
import { Header1Plus, Paragraph1 } from "@/common/ui/Text";
import Filters from "../components/Filters";
import { primaryProductHeroImage } from "@/lib/product/primaryProductHeroImage";
import { useProductsQuery } from "@/lib/queries/product/useProductsQuery";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProductCardSkeleton } from "@/common/ui/SkeletonLoaders";

type PaginationItem = number | "ellipsis";

function getPaginationItems(
  page: number,
  totalPages: number,
  siblings: number,
  maxShowAll: number,
): PaginationItem[] {
  if (totalPages <= 1) return [];

  if (totalPages <= maxShowAll) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const items: PaginationItem[] = [1];
  const rangeStart = Math.max(2, page - siblings);
  const rangeEnd = Math.min(totalPages - 1, page + siblings);

  if (rangeStart > 2) {
    items.push("ellipsis");
  }

  for (let i = rangeStart; i <= rangeEnd; i++) {
    items.push(i);
  }

  if (rangeEnd < totalPages - 1) {
    items.push("ellipsis");
  }

  items.push(totalPages);
  return items;
}

export default function NewListingsSection() {
  const [paginationConfig, setPaginationConfig] = useState({
    siblings: 4,
    maxShowAll: 10,
  });

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () =>
      setPaginationConfig(
        mq.matches
          ? { siblings: 2, maxShowAll: 8 }
          : { siblings: 4, maxShowAll: 10 },
      );
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

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
          className="flex justify-end items-center gap-4 mb-2 sm:mb-6"
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
              <div className="flex flex-nowrap justify-center items-center gap-1 sm:gap-2 mt-8 w-full min-w-0 max-w-full">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrevious}
                  className="hover:bg-gray-50 disabled:opacity-50 px-2 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded text-sm disabled:cursor-not-allowed shrink-0"
                >
                  <span className="sm:hidden">Prev</span>
                  <span className="hidden sm:inline">Previous</span>
                </button>

                <div className="flex flex-nowrap justify-center items-center gap-0.5 sm:gap-1 min-w-0 overflow-x-auto">
                  {getPaginationItems(
                    pagination.page,
                    pagination.totalPages,
                    paginationConfig.siblings,
                    paginationConfig.maxShowAll,
                  ).map((item, index) => {
                    if (item === "ellipsis") {
                      return (
                        <span
                          key={`ellipsis-${index}`}
                          className="px-1 sm:px-2 py-1.5 sm:py-2 text-gray-500 text-sm"
                        >
                          ...
                        </span>
                      );
                    }

                    const isActive = item === pagination.page;
                    return (
                      <button
                        key={item}
                        onClick={() => handlePageChange(item)}
                        className={`shrink-0 min-w-7 sm:min-w-0 px-1.5 sm:px-3 py-1.5 sm:py-2 rounded border text-sm ${
                          isActive
                            ? "bg-black text-white border-black"
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                  className="hover:bg-gray-50 disabled:opacity-50 px-2 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded text-sm disabled:cursor-not-allowed shrink-0"
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
