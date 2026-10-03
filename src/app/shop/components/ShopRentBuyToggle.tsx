"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  BUY_LISTING_TYPES,
  isShopRentMode,
  RENT_LISTING_TYPES,
} from "@/lib/shop/shopBrowse";
import { mergePreservedShopParams } from "@/lib/shop/listingFilters";

export default function ShopRentBuyToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRent = isShopRentMode(searchParams);

  const setMode = (rent: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    mergePreservedShopParams(params, searchParams);
    params.set("listingType", rent ? RENT_LISTING_TYPES : BUY_LISTING_TYPES);
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  return (
    <div
      className="inline-flex shrink-0 items-center gap-4"
      role="tablist"
      aria-label="Shop mode"
    >
      {(
        [
          { label: "Rent", rent: true },
          { label: "Buy", rent: false },
        ] as const
      ).map(({ label, rent }) => {
        const active = rent ? isRent : !isRent;
        return (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setMode(rent)}
            className={`border-b-2 pb-1 text-sm font-semibold transition ${
              active
                ? "border-black text-black"
                : "border-transparent text-gray-400 hover:text-gray-700"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
