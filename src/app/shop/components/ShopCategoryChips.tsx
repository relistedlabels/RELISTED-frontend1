"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useListingFilterOptions } from "@/lib/queries/product/useListingFilterOptions";
import { listingFiltersFromSearchParams } from "@/lib/shop/listingFilters";
import { EMPTY_LISTING_FILTER_OPTIONS } from "@/lib/shop/listingFilterOptions";
import {
  shouldPreserveShopHeading,
  syncShopHeadingParams,
} from "@/lib/shop/shopBrowse";

export default function ShopCategoryChips() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sale = searchParams.get("sale") || undefined;
  const { data: filterOptions = EMPTY_LISTING_FILTER_OPTIONS } =
    useListingFilterOptions({
      scope: "shop",
      sale,
    });
  const categories = filterOptions.categories;
  const activeCategoryIds = new Set(
    listingFiltersFromSearchParams(searchParams).category ?? [],
  );

  const toggleCategory = (categoryId: string, categoryName: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.getAll("category");
    params.delete("category");

    if (current.includes(categoryId)) {
      current
        .filter((id) => id !== categoryId)
        .forEach((id) => params.append("category", id));
      if (current.filter((id) => id !== categoryId).length === 0) {
        syncShopHeadingParams(params);
      }
    } else {
      [...current, categoryId].forEach((id) => params.append("category", id));
      if (!shouldPreserveShopHeading(searchParams)) {
        params.set("title", categoryName);
        params.set("description", `Shop ${categoryName}`);
      }
    }

    params.delete("page");
    router.push(`/shop?${params.toString()}#shop-all-listings`);
  };

  const clearCategories = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    syncShopHeadingParams(params);
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `/shop?${qs}` : "/shop");
  };

  if (categories.length === 0) return null;

  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 hide-scrollbar">
      <button
        type="button"
        onClick={clearCategories}
        className={`shrink-0 rounded-full border px-4 py-2 text-sm transition ${
          activeCategoryIds.size === 0
            ? "border-black bg-black text-white"
            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900"
        }`}
      >
        All
      </button>
      {categories.map((category) => {
        const isActive = activeCategoryIds.has(category.id);
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => toggleCategory(category.id, category.name)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm transition ${
              isActive
                ? "border-black bg-white font-semibold text-black"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900"
            }`}
          >
            {category.name}
          </button>
        );
      })}
    </div>
  );
}
