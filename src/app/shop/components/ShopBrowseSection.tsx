"use client";

import { useSearchParams } from "next/navigation";
import HomeProductRail from "@/app/home/sections/HomeProductRail";
import { Header1Plus } from "@/common/ui/Text";
import {
  isShopBrowseMode,
  isShopDefaultSort,
  isShopRentMode,
  RENT_LISTING_TYPES,
} from "@/lib/shop/shopBrowse";
import ShopCategoryChips from "./ShopCategoryChips";
import ShopOccasionTiles from "./ShopOccasionTiles";
import ShopRentBuyToggle from "./ShopRentBuyToggle";
import ShopToolbar from "./ShopToolbar";
import ShopClosetParamsGuard from "./ShopClosetParamsGuard";
import NewListingsSection from "../sections/NewListingsSection";

export default function ShopBrowseSection() {
  const searchParams = useSearchParams();
  const browseMode = isShopBrowseMode(searchParams);
  const showBrowseRails = browseMode && isShopDefaultSort(searchParams);
  const rentMode = isShopRentMode(searchParams);
  const listingTypes = rentMode
    ? RENT_LISTING_TYPES.split(",")
    : ["RESALE", "RENT_OR_RESALE"];

  const pageTitle = searchParams.get("title");
  const pageDescription = searchParams.get("description");
  const heading = pageTitle ?? "Shop";

  return (
    <div className="bg-white pt-[70px] sm:pt-[100px]">
      <ShopClosetParamsGuard />
      <section className="sticky top-[70px] z-30 border-b border-gray-100 bg-white/95 backdrop-blur-sm sm:top-[100px]">
        <div className="mx-auto container px-4 py-3 sm:px-10 sm:py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 pr-2">
              <Header1Plus className="truncate uppercase tracking-wide">
                {heading}
              </Header1Plus>
              {pageDescription ? (
                <p className="mt-1 line-clamp-2 text-sm text-gray-600 sm:line-clamp-none">
                  {pageDescription}
                </p>
              ) : browseMode ? (
                <p className="mt-1 hidden text-sm text-gray-600 sm:block">
                  {rentMode
                    ? "Rent pieces for your next moment."
                    : "Buy pieces you want to keep."}
                </p>
              ) : null}
            </div>
            <div className="shrink-0 pt-1">
              <ShopRentBuyToggle />
            </div>
          </div>

          <div className="mt-4">
            <ShopToolbar />
          </div>
        </div>
      </section>

      <div className="mx-auto container px-4 sm:px-10">
        <div className="border-b border-gray-100 py-4 sm:py-5">
          <ShopCategoryChips />
        </div>

        {showBrowseRails ? (
          <>
            <ShopOccasionTiles />
            <HomeProductRail
              embedded
              title="New In"
              subtitle="Fresh pieces ready to rent or buy."
              viewAllHref={`/shop?listingType=${RENT_LISTING_TYPES}&sort=newest#shop-all-listings`}
              sort="newest"
              filters={{ listingTypes }}
              limit={8}
              priceFocus={rentMode ? "rent" : "buy"}
            />
          </>
        ) : null}

        <NewListingsSection
          showSectionHeading
          sectionTitle={browseMode ? "All listings" : "Results"}
        />
      </div>
    </div>
  );
}
