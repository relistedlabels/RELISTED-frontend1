"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { mergePreservedShopParams } from "@/lib/shop/listingFilters";
import {
  ALL_LISTING_TYPES,
  BUY_LISTING_TYPES,
  isShopBuyMode,
  isShopRentMode,
  RENT_LISTING_TYPES,
} from "@/lib/shop/shopBrowse";

export default function ShopRentBuyToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedMode = isShopRentMode(searchParams)
    ? "rent"
    : isShopBuyMode(searchParams)
      ? "buy"
      : "all";

  const setMode = (mode: "all" | "rent" | "buy") => {
    const params = new URLSearchParams(searchParams.toString());
    mergePreservedShopParams(params, searchParams);
    const listingTypes = {
      all: ALL_LISTING_TYPES,
      rent: RENT_LISTING_TYPES,
      buy: BUY_LISTING_TYPES,
    };
    params.set("listingType", listingTypes[mode]);
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  return (
    <div
      className="inline-flex shrink-0 items-center rounded-xl border border-gray-200 bg-gray-50 p-1"
      role="tablist"
      aria-label="Shop mode"
    >
      {(
        [
          { label: "All", mode: "all" },
          { label: "Rent", mode: "rent" },
          { label: "Buy", mode: "buy" },
        ] as const
      ).map(({ label, mode }) => {
        const active = selectedMode === mode;
        return (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setMode(mode)}
            className={`relative min-h-10 min-w-[3rem] rounded-lg px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ${
              (selectedMode === "all" && mode === "buy") ||
              (selectedMode === "buy" && mode === "rent")
                ? "before:absolute before:inset-y-2 before:left-0 before:border-l before:border-gray-300"
                : ""
            } ${
              active
                ? "bg-black text-white shadow-sm"
                : "text-gray-500 hover:bg-white hover:text-gray-900"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
