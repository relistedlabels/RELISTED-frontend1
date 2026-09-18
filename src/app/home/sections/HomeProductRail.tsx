"use client";

import ProductCard from "@/common/ui/ProductCard";
import { Header1Plus, Paragraph1 } from "@/common/ui/Text";
import { useRef } from "react";
import { useHorizontalWheelScroll } from "@/hooks/useHorizontalWheelScroll";
import { useProducts } from "@/lib/queries/product/useProducts";
import { ProductCardSkeleton } from "@/common/ui/SkeletonLoaders";
import Link from "next/link";
import { primaryProductHeroImage } from "@/lib/product/primaryProductHeroImage";
import type { ListingFilterValues } from "@/lib/shop/listingFilters";

type HomeProductRailProps = {
  title: string;
  subtitle?: string;
  viewAllHref: string;
  sort?: "newest" | "popular" | "rating";
  filters?: Partial<ListingFilterValues>;
  limit?: number;
};

export default function HomeProductRail({
  title,
  subtitle,
  viewAllHref,
  sort = "newest",
  filters,
  limit = 8,
}: HomeProductRailProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const { data: products, isLoading, error } = useProducts({
    sort,
    limit,
    ...filters,
  });

  const displayProducts = products ?? [];

  useHorizontalWheelScroll(
    scrollerRef,
    !isLoading && !error && displayProducts.length > 0,
  );

  return (
    <section className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-0 py-8 sm:py-10">
      <div className="flex items-end justify-between gap-4 mb-4 sm:mb-6">
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
          className="flex gap-3 sm:gap-4 overflow-x-auto hide-scrollbar pb-1"
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
                size={product.size ?? ""}
                dailyPrice={product.dailyPrice}
                resalePrice={product.resalePrice}
                listingType={product.listingType}
                status={product.status}
                originalValue={product.originalValue}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
