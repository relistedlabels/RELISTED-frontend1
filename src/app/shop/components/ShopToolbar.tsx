"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowUpDown, Search, SlidersHorizontal, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import SelectDropdown from "@/common/ui/SelectDropdown";
import { Paragraph1 } from "@/common/ui/Text";
import { useListingFilterOptions } from "@/lib/queries/product/useListingFilterOptions";
import {
  countShopPanelFilters,
  buildShopFilterChips,
  removeShopFilterChip,
  SHOP_SORT_OPTIONS,
  shopSortFromSearchParams,
  type ShopSortValue,
} from "@/lib/shop/shopBrowse";
import {
  listingFiltersFromSearchParams,
  mergePreservedShopParams,
} from "@/lib/shop/listingFilters";
import ListingFilterPanel from "./ListingFilterPanel";

type ShopToolbarProps = {
  resultCountLabel?: string;
};

const toolbarShellClassName =
  "h-11 rounded-xl border border-gray-300 bg-white text-sm text-gray-900 transition hover:border-gray-400 hover:bg-gray-50 focus:border-black focus:outline-none focus:ring-1 focus:ring-black";

const toolbarActionClassName = `${toolbarShellClassName} font-semibold`;

const iconActionWidthClassName = "relative shrink-0 w-11";

export default function ShopToolbar({ resultCountLabel }: ShopToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchDraft, setSearchDraft] = useState(
    () => searchParams.get("search") ?? "",
  );
  const sale = searchParams.get("sale") || undefined;
  const { data: filterOptions } = useListingFilterOptions({
    scope: "shop",
    sale,
  });

  useEffect(() => {
    setSearchDraft(searchParams.get("search") ?? "");
  }, [searchParams]);

  const filters = listingFiltersFromSearchParams(searchParams);
  const panelFilterCount = countShopPanelFilters(filters);
  const sort = shopSortFromSearchParams(searchParams);
  const sortLabel =
    SHOP_SORT_OPTIONS.find((option) => option.value === sort)?.label ??
    "Newest";

  const categoryNames = useMemo(
    () =>
      new Map(
        filterOptions.categories.map((category) => [
          category.id,
          category.name,
        ]),
      ),
    [filterOptions.categories],
  );

  const chips = buildShopFilterChips(searchParams, categoryNames);

  const pushParams = (params: URLSearchParams, scrollToListings = false) => {
    const qs = params.toString();
    const hash = scrollToListings ? "#shop-all-listings" : "";
    router.push(qs ? `/shop?${qs}${hash}` : `/shop${hash}`);
  };

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = searchDraft.trim();
    if (trimmed) params.set("search", trimmed);
    else params.delete("search");
    mergePreservedShopParams(params, searchParams);
    params.delete("page");
    pushParams(params);
  };

  const setSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const nextSort = value as ShopSortValue;
    if (nextSort === "newest") params.delete("sort");
    else params.set("sort", nextSort);
    params.delete("page");
    pushParams(params, true);
  };

  const removeChip = (chip: (typeof chips)[number]) => {
    pushParams(removeShopFilterChip(searchParams, chip));
  };

  const clearAllChips = () => {
    let params = new URLSearchParams(searchParams.toString());
    for (const chip of chips) {
      params = removeShopFilterChip(params, chip);
    }
    pushParams(params);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-stretch gap-2">
        <form onSubmit={submitSearch} className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            aria-hidden
          />
          <input
            type="search"
            value={searchDraft}
            onChange={(event) => setSearchDraft(event.target.value)}
            placeholder="Search dresses, brands..."
            className={`${toolbarShellClassName} w-full py-2 pl-9 pr-3 placeholder:text-gray-400`}
          />
        </form>

        <div className={iconActionWidthClassName}>
          <SelectDropdown
            compact
            value={sort}
            options={SHOP_SORT_OPTIONS.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
            onChange={setSort}
            ariaLabel={`Sort products, ${sortLabel}`}
            placeholder="Sort"
            triggerClassName={toolbarActionClassName}
            triggerIcon={<ArrowUpDown className="h-4 w-4 shrink-0" aria-hidden />}
          />
        </div>

        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          className={`inline-flex items-center justify-center px-0 ${toolbarActionClassName} ${iconActionWidthClassName}`}
          aria-label={
            panelFilterCount > 0
              ? `Filters, ${panelFilterCount} active`
              : "Filters"
          }
        >
          <SlidersHorizontal className="h-4 w-4 shrink-0" aria-hidden />
          {panelFilterCount > 0 ? (
            <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[11px] font-bold text-white">
              {panelFilterCount}
            </span>
          ) : null}
        </button>
      </div>

      {chips.length > 0 ? (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => removeChip(chip)}
              className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-800 transition hover:border-gray-400"
            >
              {chip.label}
              <X className="h-3 w-3" aria-hidden />
            </button>
          ))}
          <button
            type="button"
            onClick={clearAllChips}
            className="px-1 text-xs font-semibold text-gray-500 underline-offset-2 hover:text-black hover:underline"
          >
            Clear all
          </button>
        </div>
      ) : null}

      {resultCountLabel ? (
        <Paragraph1 className="text-sm text-gray-600">{resultCountLabel}</Paragraph1>
      ) : null}

      <ListingFilterPanel
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        hideSearch
      />
    </div>
  );
}
