"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ChevronDown, Search } from "lucide-react";
import { toast } from "sonner";
import { Paragraph1 } from "@/common/ui/Text";
import { TableSkeleton } from "@/common/ui/SkeletonLoaders";
import { useAdminShopSalePicker } from "@/lib/queries/admin/useShopSales";
import ListingFilterPanel, {
  ListingFilterButton,
} from "@/app/shop/components/ListingFilterPanel";
import {
  pickerFiltersToApiParams,
  type ListingFilterValues,
} from "@/lib/shop/listingFilters";
import { countActiveListingFilters } from "@/lib/shop/countActiveListingFilters";
import {
  adminShopSalesApi,
  type AdminShopSalePickerProduct,
} from "@/lib/api/admin/shopSales";
import { listingPriceDisplay } from "@/lib/product/listingPriceDisplay";

type Props = {
  saleId?: string;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
};

const PAGE_SIZE = 15;

const TABLE_COLUMN_COUNT = 12;

function cell(value?: string | null) {
  return value?.trim() || "—";
}

function formatListingType(value: string) {
  return value.replace(/_/g, " ");
}

function PickerPriceCell({
  product,
}: {
  product: {
    listingType: string;
    dailyPrice: number | null;
    resalePrice: number | null;
  };
}) {
  const { listingType, primary, secondary } = listingPriceDisplay(product);

  if (listingType === "RESALE") {
    return (
      <span className="text-gray-900">
        {primary.amount > 0 ? `₦${primary.amount.toLocaleString()}` : "—"}
      </span>
    );
  }

  if (listingType === "RENT_OR_RESALE" && secondary) {
    return (
      <div className="flex items-end gap-2">
        <div className="text-right">
          <Paragraph1 className="text-[10px] uppercase tracking-wide text-gray-400 leading-none mb-1">
            Rent
          </Paragraph1>
          <Paragraph1 className="text-gray-900 leading-none">
            {primary.amount > 0
              ? `₦${primary.amount.toLocaleString()}/day`
              : "—"}
          </Paragraph1>
        </div>
        <span className="text-gray-300 pb-0.5" aria-hidden>
          |
        </span>
        <div className="text-right">
          <Paragraph1 className="text-[10px] uppercase tracking-wide text-gray-400 leading-none mb-1">
            Resale
          </Paragraph1>
          <Paragraph1 className="text-gray-900 leading-none">
            {secondary.amount > 0
              ? `₦${secondary.amount.toLocaleString()}`
              : "—"}
          </Paragraph1>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Paragraph1 className="text-[10px] uppercase tracking-wide text-gray-400 leading-none mb-1">
        Rent
      </Paragraph1>
      <Paragraph1 className="text-gray-900 leading-none">
        {primary.amount > 0 ? `₦${primary.amount.toLocaleString()}/day` : "—"}
      </Paragraph1>
    </div>
  );
}

const EMPTY_FILTERS: ListingFilterValues = {
  category: [],
  tags: [],
  brand: [],
  lister: [],
  listingTypes: [],
};

function mergeUniqueIds(current: string[], next: string[]) {
  return [...new Set([...current, ...next])];
}

function SelectionMenuItem({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full px-3 py-2 text-left text-sm font-normal text-gray-700 hover:bg-gray-50 disabled:text-gray-400 disabled:hover:bg-transparent disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}

export default function SaleItemPicker({
  saleId,
  selectedIds,
  onChange,
}: Props) {
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] =
    useState<ListingFilterValues>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [selectMenuOpen, setSelectMenuOpen] = useState(false);
  const [selectAllMatchingLoading, setSelectAllMatchingLoading] = useState(false);
  const [matchingSelection, setMatchingSelection] = useState<{
    filterKey: string;
    ids: Set<string>;
  } | null>(null);
  const selectMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPage(1);
  }, [appliedSearch, appliedFilters]);

  const filterParams = useMemo(
    () => ({
      search: appliedSearch || undefined,
      ...pickerFiltersToApiParams(appliedFilters),
    }),
    [appliedSearch, appliedFilters],
  );

  const filterKey = useMemo(() => JSON.stringify(filterParams), [filterParams]);

  useEffect(() => {
    setMatchingSelection(null);
  }, [filterKey]);

  const activeFilterCount = useMemo(
    () => countActiveListingFilters(appliedFilters),
    [appliedFilters],
  );

  const shouldPinSelected =
    !appliedSearch.trim() && activeFilterCount === 0 && selectedIds.length > 0;

  const pickerParams = useMemo(
    () => ({
      ...filterParams,
      page,
      limit: PAGE_SIZE,
      saleId,
      prioritizeIds:
        shouldPinSelected && page === 1 ? selectedIds : undefined,
    }),
    [filterParams, page, saleId, shouldPinSelected, selectedIds],
  );

  const { data, isLoading, isError } = useAdminShopSalePicker(pickerParams);

  const displayProducts = data?.data?.products ?? [];
  const total = data?.data?.total ?? 0;
  const totalPages = data?.data?.totalPages ?? 1;
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  useEffect(() => {
    if (!selectMenuOpen) return;
    const handleClick = (event: MouseEvent) => {
      if (
        selectMenuRef.current &&
        !selectMenuRef.current.contains(event.target as Node)
      ) {
        setSelectMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [selectMenuOpen]);

  const pageIds = useMemo(
    () => displayProducts.map((product) => product.id),
    [displayProducts],
  );
  const selectedOnPageCount = useMemo(
    () => pageIds.filter((id) => selectedSet.has(id)).length,
    [pageIds, selectedSet],
  );
  const allOnPageSelected =
    pageIds.length > 0 && selectedOnPageCount === pageIds.length;
  const someOnPageSelected =
    selectedOnPageCount > 0 && selectedOnPageCount < pageIds.length;

  const toggle = (id: string) => {
    if (selectedSet.has(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const selectAllOnPage = () => {
    onChange(mergeUniqueIds(selectedIds, pageIds));
  };

  const deselectAllOnPage = () => {
    const pageIdSet = new Set(pageIds);
    onChange(selectedIds.filter((id) => !pageIdSet.has(id)));
  };

  const selectAllMatching = async () => {
    setSelectAllMatchingLoading(true);
    try {
      const response = await adminShopSalesApi.listMatchingProductIds(filterParams);
      const ids = response.data.productIds;
      onChange(mergeUniqueIds(selectedIds, ids));
      setMatchingSelection({
        filterKey,
        ids: new Set(ids),
      });
      toast.success(
        `Added ${ids.length} listing${ids.length === 1 ? "" : "s"} to selection`,
      );
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Could not select all matching listings";
      toast.error(message);
    } finally {
      setSelectAllMatchingLoading(false);
      setSelectMenuOpen(false);
    }
  };

  const deselectAllMatching = async () => {
    setSelectMenuOpen(false);
    if (matchingSelection?.filterKey === filterKey) {
      onChange(selectedIds.filter((id) => !matchingSelection.ids.has(id)));
      setMatchingSelection(null);
      return;
    }

    setSelectAllMatchingLoading(true);
    try {
      const response = await adminShopSalesApi.listMatchingProductIds(filterParams);
      const matchingIds = new Set(response.data.productIds);
      onChange(selectedIds.filter((id) => !matchingIds.has(id)));
    } catch {
      toast.error("Could not update selection");
    } finally {
      setSelectAllMatchingLoading(false);
    }
  };

  const clearAll = () => {
    onChange([]);
    setMatchingSelection(null);
    setSelectMenuOpen(false);
  };

  const handleHeaderCheckboxChange = () => {
    if (allOnPageSelected) {
      deselectAllOnPage();
    } else {
      selectAllOnPage();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <Paragraph1 className="font-medium text-gray-900">
            {selectedIds.length} listing{selectedIds.length === 1 ? "" : "s"}{" "}
            selected
          </Paragraph1>
          <Paragraph1 className="text-gray-500 text-sm">
            Search by item name, lister, brand, or category.
          </Paragraph1>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <form
          className="flex flex-1 gap-2 min-w-0"
          onSubmit={(e) => {
            e.preventDefault();
            setAppliedSearch(search.trim());
          }}
        >
          <div className="flex flex-1 items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg min-w-0">
            <Search className="w-4 h-4 text-gray-400 shrink-0" aria-hidden />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search listings..."
              className="flex-1 bg-transparent outline-none min-w-0 text-sm"
            />
          </div>
          <button
            type="submit"
            className="shrink-0 bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded-lg font-medium text-white text-sm"
          >
            Search
          </button>
        </form>
        <ListingFilterButton
          onClick={() => setFiltersOpen(true)}
          activeCount={activeFilterCount}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 flex items-center gap-1 shrink-0"
        />
      </div>

      <ListingFilterPanel
        mode="controlled"
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        value={appliedFilters}
        onApply={setAppliedFilters}
        onClear={() => setAppliedFilters(EMPTY_FILTERS)}
        hideSearch
        filterOptionsScope="admin-picker"
      />

      {isError ? (
        <Paragraph1 className="text-red-600 text-sm">
          Could not load listings. Try again.
        </Paragraph1>
      ) : isLoading ? (
        <TableSkeleton rows={6} columns={TABLE_COLUMN_COUNT} />
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1100px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-3 w-11">
                    <div className="relative inline-flex items-center" ref={selectMenuRef}>
                      <input
                        type="checkbox"
                        checked={allOnPageSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = someOnPageSelected;
                        }}
                        onChange={handleHeaderCheckboxChange}
                        className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                        aria-label="Select all listings on this page"
                      />
                      <button
                        type="button"
                        onClick={() => setSelectMenuOpen((open) => !open)}
                        className="ml-0.5 p-0.5 rounded text-gray-500 hover:text-gray-800 hover:bg-gray-200/80"
                        aria-label="More selection options"
                        aria-expanded={selectMenuOpen}
                      >
                        <ChevronDown size={14} strokeWidth={2} />
                      </button>
                      {selectMenuOpen ? (
                        <div
                          role="menu"
                          className="absolute left-0 top-full z-20 mt-1.5 w-52 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                        >
                          <SelectionMenuItem
                            onClick={() => {
                              selectAllOnPage();
                              setSelectMenuOpen(false);
                            }}
                          >
                            Select current page
                          </SelectionMenuItem>
                          <SelectionMenuItem
                            onClick={selectAllMatching}
                            disabled={selectAllMatchingLoading || total === 0}
                          >
                            Select all results ({total})
                          </SelectionMenuItem>
                          <SelectionMenuItem
                            onClick={() => {
                              deselectAllOnPage();
                              setSelectMenuOpen(false);
                            }}
                            disabled={selectedOnPageCount === 0}
                          >
                            Deselect current page
                          </SelectionMenuItem>
                          <SelectionMenuItem
                            onClick={deselectAllMatching}
                            disabled={
                              selectAllMatchingLoading ||
                              total === 0 ||
                              selectedIds.length === 0
                            }
                          >
                            Deselect all results ({total})
                          </SelectionMenuItem>
                          <div className="my-1 border-t border-gray-100" />
                          <SelectionMenuItem
                            onClick={clearAll}
                            disabled={selectedIds.length === 0}
                          >
                            Clear selection
                          </SelectionMenuItem>
                        </div>
                      ) : null}
                    </div>
                  </th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-600 text-xs uppercase whitespace-nowrap">
                    Listing
                  </th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-600 text-xs uppercase whitespace-nowrap">
                    Brand
                  </th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-600 text-xs uppercase whitespace-nowrap">
                    Category
                  </th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-600 text-xs uppercase whitespace-nowrap">
                    Subcategories
                  </th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-600 text-xs uppercase whitespace-nowrap">
                    Lister
                  </th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-600 text-xs uppercase whitespace-nowrap">
                    Type
                  </th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-600 text-xs uppercase whitespace-nowrap">
                    Size
                  </th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-600 text-xs uppercase whitespace-nowrap">
                    Color
                  </th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-600 text-xs uppercase whitespace-nowrap">
                    Condition
                  </th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-600 text-xs uppercase whitespace-nowrap">
                    Material
                  </th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-600 text-xs uppercase whitespace-nowrap">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={TABLE_COLUMN_COUNT}
                      className="px-4 py-10 text-center text-gray-500"
                    >
                      No listings match your search.
                    </td>
                  </tr>
                ) : (
                  displayProducts.map((p: AdminShopSalePickerProduct) => {
                    const checked = selectedSet.has(p.id);
                    return (
                      <tr
                        key={p.id}
                        className={`border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 ${checked ? "bg-gray-50/80" : ""}`}
                        onClick={() => toggle(p.id)}
                      >
                        <td className="px-3 py-3">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggle(p.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="rounded border-gray-300"
                            aria-label={`Select ${p.name}`}
                          />
                        </td>
                        <td className="px-3 py-3 min-w-[180px]">
                          <div className="flex items-center gap-3 min-w-0">
                            {p.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={p.imageUrl}
                                alt=""
                                className="w-10 h-10 rounded object-cover shrink-0 border border-gray-100"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded bg-gray-100 shrink-0" />
                            )}
                            <Paragraph1 className="font-medium text-gray-900 truncate">
                              {p.name}
                            </Paragraph1>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-gray-700 whitespace-nowrap">
                          {cell(p.brandName)}
                        </td>
                        <td className="px-3 py-3 text-gray-700 whitespace-nowrap">
                          {cell(p.categoryName)}
                        </td>
                        <td
                          className="px-3 py-3 text-gray-700 max-w-[140px] truncate"
                          title={p.tagNames.join(", ")}
                        >
                          {p.tagNames.length > 0 ? p.tagNames.join(", ") : "—"}
                        </td>
                        <td className="px-3 py-3 text-gray-700 whitespace-nowrap">
                          {p.listerName}
                        </td>
                        <td className="px-3 py-3 text-gray-600 whitespace-nowrap">
                          {formatListingType(p.listingType)}
                        </td>
                        <td className="px-3 py-3 text-gray-700 whitespace-nowrap">
                          {cell(p.size)}
                        </td>
                        <td className="px-3 py-3 text-gray-700 whitespace-nowrap">
                          {cell(p.color)}
                        </td>
                        <td className="px-3 py-3 text-gray-700 whitespace-nowrap">
                          {cell(p.condition)}
                        </td>
                        <td className="px-3 py-3 text-gray-700 whitespace-nowrap">
                          {cell(p.material)}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <PickerPriceCell product={p} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 ? (
            <div className="flex justify-between items-center px-4 py-3 border-t border-gray-200 bg-white">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <Paragraph1 className="text-gray-600 text-sm">
                Page {page} of {totalPages}
              </Paragraph1>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
