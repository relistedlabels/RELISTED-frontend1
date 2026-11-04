"use client";

import { useSearchParams } from "next/navigation";
import { Header1Plus } from "@/common/ui/Text";
import {
  isShopBrowseMode,
  isShopBuyMode,
  isShopRentMode,
} from "@/lib/shop/shopBrowse";
import NewListingsSection from "../sections/NewListingsSection";
import ShopClosetParamsGuard from "./ShopClosetParamsGuard";
import ShopFilterBar from "./ShopFilterBar";
import ShopRentBuyToggle from "./ShopRentBuyToggle";
import ShopToolbar from "./ShopToolbar";
import {
  SITE_FIXED_HEADER_PT,
  SITE_FIXED_HEADER_STICKY_TOP,
} from "@/lib/layout/siteNavOffset";

export default function ShopBrowseSection() {
  const searchParams = useSearchParams();
  const browseMode = isShopBrowseMode(searchParams);
  const rentMode = isShopRentMode(searchParams);
  const buyMode = isShopBuyMode(searchParams);

  const pageTitle = searchParams.get("title");
  const pageDescription = searchParams.get("description");
  const heading = pageTitle ?? "Shop";

  return (
    <div className={`bg-white ${SITE_FIXED_HEADER_PT}`}>
      <ShopClosetParamsGuard />
      <section
        className={`sticky z-30 border-b border-gray-100 bg-white/95 backdrop-blur-sm ${SITE_FIXED_HEADER_STICKY_TOP}`}
      >
        <div className="mx-auto container px-4 py-3 sm:px-10 sm:py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 pr-2">
              <Header1Plus className="truncate uppercase tracking-wide">
                {heading}
              </Header1Plus>
              {pageDescription ? (
                <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                  {pageDescription}
                </p>
              ) : browseMode ? (
                <p className="mt-1 hidden text-sm text-gray-600 sm:block">
                  {rentMode
                    ? "Rent pieces for your next moment."
                    : buyMode
                      ? "Buy pieces you want to keep."
                      : "Rent or buy pieces for your next moment."}
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
