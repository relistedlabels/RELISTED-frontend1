"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, SlidersHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useListingFilterOptions } from "@/lib/queries/product/useListingFilterOptions";
import {
  countShopPanelFilters,
  shopSortFromSearchParams,
  type ShopSortValue,
} from "@/lib/shop/shopBrowse";
import {
  listingFiltersFromSearchParams,
  mergePreservedShopParams,
  parseMultiSearchParam,
} from "@/lib/shop/listingFilters";
import { EMPTY_LISTING_FILTER_OPTIONS } from "@/lib/shop/listingFilterOptions";
import { shopOccasionsFromFilterOptions } from "@/lib/shop/shopOccasions";
import QuickFilterDropdown from "./QuickFilterDropdown";
import ListingFilterPanel from "./ListingFilterPanel";
import SortPanel from "./SortPanel";

const toolbarShellClassName =
  "h-11 rounded-xl border border-gray-300 bg-white text-sm text-gray-900 transition hover:border-gray-400 hover:bg-gray-50 focus:border-black focus:outline-none focus:ring-1 focus:ring-black";

const toolbarActionClassName = `${toolbarShellClassName} font-semibold`;

const iconActionWidthClassName = "relative shrink-0 w-11";

export default function ShopFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sale = searchParams.get("sale") || undefined;
  const { data: filterOptions = EMPTY_LISTING_FILTER_OPTIONS } =
    useListingFilterOptions({ scope: "shop", sale });

  const [sortOpen, setSortOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filters = listingFiltersFromSearchParams(searchParams);
  const panelFilterCount = countShopPanelFilters(filters);
  const currentSort = shopSortFromSearchParams(searchParams);

  const sizeOptions = useMemo(
    () => filterOptions.sizes.map((size) => ({ value: size, label: size })),
    [filterOptions.sizes],
  );

  const categoryOptions = useMemo(
    () =>
      filterOptions.categories.map((category) => ({
        value: category.id,
        label: category.name,
      })),
    [filterOptions.categories],
  );

  const occasionOptions = useMemo(
    () =>
      shopOccasionsFromFilterOptions(filterOptions).map((occasion) => ({
        value: occasion.tag,
        label: occasion.title,
      })),
    [filterOptions],
  );

  const pushParams = (params: URLSearchParams) => {
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `/shop?${qs}` : "/shop", { scroll: false });
  };

  const toggleListParam = (
    key: "size" | "category" | "tags",
    value: string,
    checked: boolean,
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    let current: string[] = [];

    if (key === "category") {
      current = params.getAll("category");
    } else if (key === "size") {
      current = parseMultiSearchParam(params, "size");
    } else {
      current = params.get("tags")?.split(",").filter(Boolean) ?? [];
    }

    const next = checked
      ? [...current, value]
      : current.filter((entry) => entry !== value);

    if (key === "category") {
      params.delete("category");
      next.forEach((entry) => params.append("category", entry));
    } else if (key === "size") {
      if (next.length > 0) params.set("size", next.join(","));
      else params.delete("size");
    } else if (next.length > 0) {
      params.set("tags", next.join(","));
    } else {
      params.delete("tags");
    }

    mergePreservedShopParams(params, searchParams);
    pushParams(params);
  };

  return (
    <>
      <div className="mt-3 flex items-center gap-2 sm:gap-3">
        <div className="-mx-1 flex min-w-0 flex-1 items-center gap-x-4 overflow-x-auto px-1 hide-scrollbar sm:gap-x-5">
          <QuickFilterDropdown
            label="Size"
            options={sizeOptions}
            selected={filters.size ?? []}
            onToggle={(value, checked) =>
              toggleListParam("size", value, checked)
            }
            emptyMessage="No sizes available"
          />

          <QuickFilterDropdown
            label="Category"
            options={categoryOptions}
            selected={filters.category ?? []}
            onToggle={(value, checked) =>
              toggleListParam("category", value, checked)
            }
            emptyMessage="No categories available"
          />

          <QuickFilterDropdown
            label="Occasion"
            options={occasionOptions}
            selected={filters.tags ?? []}
            onToggle={(value, checked) =>
              toggleListParam("tags", value, checked)
            }
            emptyMessage="No occasions available"
          />
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setSortOpen(true)}
            className={`inline-flex items-center justify-center gap-1.5 px-0 sm:px-3 ${toolbarActionClassName} ${iconActionWidthClassName} sm:w-auto`}
            aria-label="Sort products"
          >
            <ArrowUpDown className="h-4 w-4 shrink-0" aria-hidden />
            <span className="hidden sm:inline">Sort</span>
          </button>

          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className={`inline-flex items-center justify-center gap-1.5 px-0 sm:px-3 ${toolbarActionClassName} ${iconActionWidthClassName} sm:w-auto`}
            aria-label={
              panelFilterCount > 0
                ? `Filters, ${panelFilterCount} active`
                : "Filters"
            }
          >
            <SlidersHorizontal className="h-4 w-4 shrink-0" aria-hidden />
            <span className="hidden sm:inline">Filter</span>
            {panelFilterCount > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[11px] font-bold text-white">
                {panelFilterCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      <SortPanel
        isOpen={sortOpen}
        onClose={() => setSortOpen(false)}
        currentSort={currentSort as ShopSortValue}
      />

      <ListingFilterPanel
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        hideSearch
      />
    </>
  );
}
