"use client";

import ProductCard from "@/common/ui/ProductCard";
import { Header1Plus, Paragraph1 } from "@/common/ui/Text";
import { useRef } from "react";
import { useHorizontalWheelScroll } from "@/hooks/useHorizontalWheelScroll";
import { useProducts } from "@/lib/queries/product/useProducts";
import { ProductCardSkeleton } from "@/common/ui/SkeletonLoaders";
import Link from "next/link";
import { primaryProductHeroImage } from "@/lib/product/primaryProductHeroImage";
import type { ProductCardPriceFocus } from "@/common/ui/ProductCard";
import {
  normalizeListingFilters,
  pickerFiltersToApiParams,
  type ListingFilterValues,
} from "@/lib/shop/listingFilters";

type HomeProductRailProps = {
  title: string;
  subtitle?: string;
  viewAllHref: string;
  sort?: "newest" | "popular" | "rating";
  filters?: Partial<ListingFilterValues>;
  limit?: number;
  /** Tighter layout when nested inside another shop container. */
  embedded?: boolean;
  priceFocus?: ProductCardPriceFocus;
};

export default function HomeProductRail({
  title,
  subtitle,
  viewAllHref,
  sort = "newest",
  filters,
  limit = 8,
  embedded = false,
  priceFocus = "rent",
}: HomeProductRailProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const normalizedFilters = normalizeListingFilters(filters);
  const apiFilters = pickerFiltersToApiParams(normalizedFilters);
  const { data: products, isLoading, error } = useProducts({
    sort,
    limit,
    search: normalizedFilters.search,
    category: apiFilters.category
      ? apiFilters.category.split(",")
      : undefined,
    tags: apiFilters.tags,
    brand: apiFilters.brand,
    listingType: apiFilters.listingType,
    lister: apiFilters.lister,
    size: apiFilters.size,
    color: apiFilters.color,
    condition: apiFilters.condition,
    material: apiFilters.material,
    minPrice: apiFilters.minPrice,
    maxPrice: apiFilters.maxPrice,
  });

  const displayProducts = products ?? [];

  useHorizontalWheelScroll(
    scrollerRef,
    !isLoading && !error && displayProducts.length > 0,
  );

  return (
    <section
      className={
        embedded
          ? "border-b border-gray-100 py-8 sm:py-10 last:border-b-0"
          : "container mx-auto px-3 py-8 sm:px-4 sm:py-10 md:px-6 lg:px-0"
      }
    >
      <div className="mb-4 flex items-end justify-between gap-4 sm:mb-5">
        <div>
          <Header1Plus className="uppercase tracking-wide">{title}</Header1Plus>
          {subtitle ? (
            <Paragraph1 className="text-gray-600 mt-1 max-w-md">{subtitle}</Paragraph1>
          ) : null}
        </div>
        <Link
          href={viewAllHref}
          className="shrink-0 text-sm font-semibold border-b border-black hover:opacity-70 transition-opacity"
        >
          View all
        </Link>
      </div>

      {isLoading ? (
        <ProductCardSkeleton count={4} />
      ) : error || displayProducts.length === 0 ? (
        <Paragraph1 className="text-gray-500 text-sm">
          New pieces are on the way. Check back soon.
        </Paragraph1>
      ) : (
        <div
          ref={scrollerRef}
          className="flex gap-4 overflow-x-auto hide-scrollbar pb-1 sm:gap-5"
        >
          {displayProducts.map((product) => (
            <div
              key={product.id}
              className="shrink-0 w-[160px] sm:w-[200px] md:w-[220px]"
            >
              <ProductCard
                id={product.id}
                image={primaryProductHeroImage(product)}
                brand={product.brand?.name ?? ""}
                name={product.name}
                price={`₦${(product.originalValue || 0).toLocaleString()}`}
                dailyPrice={product.dailyPrice}
                resalePrice={product.resalePrice}
                listingType={product.listingType}
                size={product.measurement}
                isSold={product.status === "SOLD"}
                isRentedOut={product.status === "RENTED"}
                priceFocus={priceFocus}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
