"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";
import { Header1Plus, Paragraph1 } from "@/common/ui/Text";
import { useHorizontalWheelScroll } from "@/hooks/useHorizontalWheelScroll";
import { useListingFilterOptions } from "@/lib/queries/product/useListingFilterOptions";
import { EMPTY_LISTING_FILTER_OPTIONS } from "@/lib/shop/listingFilterOptions";
import { shopOccasionsFromFilterOptions } from "@/lib/shop/shopOccasions";
import { shouldPreserveShopHeading } from "@/lib/shop/shopBrowse";

export default function ShopOccasionTiles() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const { data: filterOptions = EMPTY_LISTING_FILTER_OPTIONS } =
    useListingFilterOptions({ scope: "shop" });
  const occasions = shopOccasionsFromFilterOptions(filterOptions);
  const activeTag = searchParams.get("tags")?.split(",")[0]?.trim() ?? "";

  useHorizontalWheelScroll(scrollerRef, occasions.length > 0);

  if (occasions.length === 0) return null;

  const applyOccasion = (title: string, description: string, tag: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tags", tag);
    if (!shouldPreserveShopHeading(searchParams)) {
      params.set("title", title);
      params.set("description", description);
    }
    params.delete("page");
    router.push(`/shop?${params.toString()}#shop-all-listings`);
  };

  return (
    <section className="border-b border-gray-100 py-8 sm:py-10">
      <div className="mb-4 sm:mb-5">
        <Header1Plus className="uppercase tracking-wide">Shop by occasion</Header1Plus>
        <Paragraph1 className="mt-1 max-w-lg text-sm text-gray-600">
          Curated edits for where you are going.
        </Paragraph1>
      </div>

      <div
        ref={scrollerRef}
        className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 hide-scrollbar sm:gap-4"
      >
        {occasions.map((occasion, index) => {
          const isActive = activeTag === occasion.tag;
          return (
            <button
              key={occasion.tag}
              type="button"
              onClick={() =>
                applyOccasion(occasion.title, occasion.description, occasion.tag)
              }
              className={`group relative h-44 w-[148px] shrink-0 overflow-hidden rounded-2xl sm:h-52 sm:w-[180px] ${
                isActive ? "ring-2 ring-black ring-offset-2" : ""
              }`}
            >
              <Image
                src={occasion.image}
                alt={occasion.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="180px"
                priority={index < 2}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3 text-left text-white sm:p-4">
                <span className="block text-sm font-bold leading-snug sm:text-base">
                  {occasion.title}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
