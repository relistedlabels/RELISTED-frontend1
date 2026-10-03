// ENDPOINTS: GET /api/public/products

"use client";

import ProductCard from "@/common/ui/ProductCard";
import { Header1Plus, Paragraph1 } from "@/common/ui/Text";
import { primaryProductHeroImage } from "@/lib/product/primaryProductHeroImage";
import { useProductsQuery } from "@/lib/queries/product/useProductsQuery";
import { isShopRentMode, shopResultCountLabel } from "@/lib/shop/shopBrowse";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ProductCardSkeleton } from "@/common/ui/SkeletonLoaders";

const LISTINGS_ANCHOR_ID = "shop-all-listings";

function scrollToListingsSection(behavior: ScrollBehavior = "smooth") {
  document.getElementById(LISTINGS_ANCHOR_ID)?.scrollIntoView({
    behavior,
    block: "start",
  });
}

type PaginationItem = number | "ellipsis";

type NewListingsSectionProps = {
  showSectionHeading?: boolean;
  sectionTitle?: string;
};

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

export default function NewListingsSection({
  showSectionHeading = false,
  sectionTitle = "All listings",
}: NewListingsSectionProps) {
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

  const {
    data: { products: filteredProducts = [], pagination } = {},
    isLoading: loading,
    isFetching,
    error,
  } = useProductsQuery();
  const router = useRouter();
  const searchParams = useSearchParams();
  const priceFocus = isShopRentMode(searchParams) ? "rent" : "buy";
  const pageParam = searchParams.get("page") ?? "1";
  const prevPageParam = useRef(pageParam);

  useEffect(() => {
    if (loading) return;
    if (prevPageParam.current === pageParam) return;

    const page = Number(pageParam) || 1;
    prevPageParam.current = pageParam;
    if (page <= 1) return;

    scrollToListingsSection();
  }, [pageParam, loading]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}#${LISTINGS_ANCHOR_ID}`, {
      scroll: false,
    });
  };

  const total = pagination?.total ?? filteredProducts.length;
  const countLabel = shopResultCountLabel(total, searchParams);

  if (loading) {
    return (
      <section
        id={LISTINGS_ANCHOR_ID}
        className="w-full scroll-mt-36 py-4 sm:py-10"
      >
        <div className="mx-auto container">
          {showSectionHeading ? (
            <div className="mb-2 sm:mb-6">
              <Header1Plus className="font-light">{sectionTitle}</Header1Plus>
              <Paragraph1 className="mt-2 text-gray-600">
                Loading products...
              </Paragraph1>
            </div>
          ) : null}
          <ProductCardSkeleton
            count={15}
            className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-7 md:grid-cols-4 lg:grid-cols-5 lg:gap-x-5"
          />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section
        id={LISTINGS_ANCHOR_ID}
        className="w-full scroll-mt-36 py-4 sm:pb-10"
      >
        <div className="mx-auto container">
          {showSectionHeading ? (
            <div className="mb-2 sm:mb-6">
              <Header1Plus className="font-light">{sectionTitle}</Header1Plus>
            </div>
          ) : null}
          <ProductCardSkeleton
            count={15}
            className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-7 md:grid-cols-4 lg:grid-cols-5 lg:gap-x-5"
          />
        </div>
      </section>
    );
  }

  return (
    <section
      id={LISTINGS_ANCHOR_ID}
      className="w-full scroll-mt-40 py-8 sm:scroll-mt-44 sm:py-10"
    >
      <div className="mx-auto w-full">
        {showSectionHeading ? (
          <div className="mb-5 border-b border-gray-100 pb-4 sm:mb-6">
            <Header1Plus className="uppercase tracking-wide">
              {sectionTitle}
            </Header1Plus>
            <Paragraph1 className="mt-1 text-sm text-gray-600">
              {countLabel}
            </Paragraph1>
          </div>
        ) : null}

        {filteredProducts.length === 0 ? (
          <div className="py-12 text-center">
            <Paragraph1 className="text-gray-600">
              No products found matching your criteria.
            </Paragraph1>
          </div>
        ) : (
          <>
            <div
              className={`grid grid-cols-2 gap-x-3 gap-y-6 transition-opacity duration-200 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-7 md:grid-cols-4 lg:grid-cols-5 lg:gap-x-5 ${
                isFetching && !loading ? "opacity-60" : "opacity-100"
              }`}
            >
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
                  priceFocus={priceFocus}
                />
              ))}
            </div>

            {pagination && pagination.totalPages > 1 ? (
              <div className="mt-8 flex w-full min-w-0 max-w-full flex-nowrap items-center justify-center gap-1 sm:gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrevious}
                  className="shrink-0 rounded border border-gray-300 px-2 py-1.5 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-2"
                >
                  <span className="sm:hidden">Prev</span>
                  <span className="hidden sm:inline">Previous</span>
                </button>

                <div className="flex min-w-0 flex-nowrap items-center justify-center gap-0.5 overflow-x-auto sm:gap-1">
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
                          className="px-1 py-1.5 text-sm text-gray-500 sm:px-2 sm:py-2"
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
                        className={`min-w-7 shrink-0 rounded border px-1.5 py-1.5 text-sm sm:min-w-0 sm:px-3 sm:py-2 ${
                          isActive
                            ? "border-black bg-black text-white"
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
                  className="shrink-0 rounded border border-gray-300 px-2 py-1.5 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-2"
                >
                  Next
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
