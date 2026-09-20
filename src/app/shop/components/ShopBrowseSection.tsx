"use client";

import { useSearchParams } from "next/navigation";
import { Header1Plus } from "@/common/ui/Text";
import { isShopBrowseMode, isShopRentMode } from "@/lib/shop/shopBrowse";
import ShopRentBuyToggle from "./ShopRentBuyToggle";
import ShopToolbar from "./ShopToolbar";
import ShopFilterBar from "./ShopFilterBar";
import ShopClosetParamsGuard from "./ShopClosetParamsGuard";
import NewListingsSection from "../sections/NewListingsSection";

export default function ShopBrowseSection() {
  const searchParams = useSearchParams();
  const browseMode = isShopBrowseMode(searchParams);
  const rentMode = isShopRentMode(searchParams);

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
            <ShopToolbar searchOnly />
          </div>

          <ShopFilterBar />
        </div>
      </section>

      <div className="mx-auto container px-4 sm:px-10">
        <NewListingsSection showSectionHeading={false} />
      </div>
    </div>
  );
}
