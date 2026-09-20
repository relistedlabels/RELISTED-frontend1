"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search, SlidersVertical, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Paragraph1 } from "@/common/ui/Text";
import { slidePanelActionsFooter } from "@/common/ui/dashboardClasses";
import { useListingFilterOptions } from "@/lib/queries/product/useListingFilterOptions";
import {
  EMPTY_LISTING_FILTER_OPTIONS,
} from "@/lib/shop/listingFilterOptions";
import {
  appendListingFiltersToParams,
  listingFiltersFromSearchParams,
  listOrEmpty,
  mergePreservedShopParams,
  type ListingFilterValues,
} from "@/lib/shop/listingFilters";
import PriceFilterInputs from "./PriceFilterInputs";

const variants = {
  hidden: { x: "100%" },
  visible: { x: 0 },
};

const filterSectionTitle =
  "text-xs font-semibold uppercase tracking-wide text-gray-900 mb-3";

const filterSearchInput =
  "mb-2 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-black focus:ring-1 focus:ring-black";

const filterOptionLabel =
  "flex cursor-pointer select-none items-center gap-2.5 rounded-lg py-1.5 text-sm text-gray-700 transition hover:bg-gray-50 hover:text-gray-900";

const filterCheckbox =
  "h-4 w-4 shrink-0 rounded border-gray-300 text-black focus:ring-black";

const filterRadio =
  "h-4 w-4 shrink-0 border-gray-300 text-black focus:ring-black";

type PanelState = ListingFilterValues & {
  search: string;
};

function emptyPanelState(): PanelState {
  return {
    search: "",
    category: [],
    tags: [],
    brand: [],
    lister: [],
    availability: [],
    listingTypes: [],
    size: [],
    color: [],
  };
}

function fromSearchParams(searchParams: URLSearchParams): PanelState {
  const parsed = listingFiltersFromSearchParams(searchParams);
  return {
    ...parsed,
    search: searchParams.get("search") || "",
    listingTypes: parsed.listingTypes ?? [],
  };
}

function fromListingFilters(value: ListingFilterValues): PanelState {
  return {
    ...value,
    search: value.search || "",
    category: value.category ?? [],
    tags: value.tags ?? [],
    brand: value.brand ?? [],
    lister: value.lister ?? [],
    availability: [],
    listingTypes: value.listingTypes ?? [],
    size: value.size ?? [],
    color: value.color ?? [],
  };
}

function toListingFilters(state: PanelState): ListingFilterValues {
  return {
    search: state.search || undefined,
    category: state.category,
    tags: state.tags,
    brand: state.brand,
    lister: state.lister,
    listingTypes: state.listingTypes,
    size: state.size,
    color: state.color,
    condition: state.condition,
    material: state.material,
    minPrice: state.minPrice,
    maxPrice: state.maxPrice,
  };
}

export type ListingFilterSection = "category" | "size";

export type ListingFilterPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  mode?: "url" | "controlled";
  value?: ListingFilterValues;
  onApply?: (filters: ListingFilterValues) => void;
  onClear?: () => void;
  hideSearch?: boolean;
  initialSection?: ListingFilterSection;
  filterOptionsScope?: "shop" | "admin-picker";
};

export function ListingFilterButton({
  onClick,
  activeCount = 0,
  className,
}: {
  onClick: () => void;
  activeCount?: number;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        className ??
        "border px-4 items-center py-2 flex gap-1 font-semibold text-sm border-black hover:bg-gray-100 transition shrink-0"
      }
    >
      <Paragraph1>
        Filters{activeCount > 0 ? ` (${activeCount})` : ""}
      </Paragraph1>
      <SlidersVertical size={18} />
    </button>
  );
}

export default function ListingFilterPanel({
  isOpen,
  onClose,
  mode = "url",
  value,
  onApply,
  onClear,
  hideSearch = false,
  initialSection,
  filterOptionsScope = "shop",
}: ListingFilterPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const saleSlug = searchParams.get("sale") || undefined;
  const closetId = searchParams.get("closetId") || undefined;
  const onlyWithCloset = searchParams.get("onlyWithCloset") === "true";

  const {
    data: filterOptions = EMPTY_LISTING_FILTER_OPTIONS,
    isPending: optionsLoading,
    isError: optionsError,
  } = useListingFilterOptions({
    scope: filterOptionsScope,
    sale: filterOptionsScope === "shop" ? saleSlug : undefined,
    closetId: filterOptionsScope === "shop" ? closetId : undefined,
    onlyWithCloset: filterOptionsScope === "shop" ? onlyWithCloset : undefined,
  });

  const [brandSearch, setBrandSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [tagSearch, setTagSearch] = useState("");
  const [listerSearch, setListerSearch] = useState("");
  const [localFilters, setLocalFilters] = useState<PanelState>(emptyPanelState);
  const [mounted, setMounted] = useState(false);
  const categorySectionRef = useRef<HTMLElement | null>(null);
  const sizeSectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    if (mode === "url") {
      setLocalFilters(fromSearchParams(searchParams));
    } else if (value) {
      setLocalFilters(fromListingFilters(value));
    }
    // Sync draft state only when the panel opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !initialSection) return;
    const target =
      initialSection === "category"
        ? categorySectionRef.current
        : sizeSectionRef.current;
    if (!target) return;
    const frame = requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, [isOpen, initialSection]);

  const toggleList = (list: string[], item: string, checked: boolean) =>
    checked ? [...list, item] : list.filter((entry) => entry !== item);

  const handleApplyFilters = () => {
    const next = toListingFilters(localFilters);

    if (mode === "url") {
      const params = new URLSearchParams();
      appendListingFiltersToParams(params, next);
      mergePreservedShopParams(params, searchParams);
      params.set("page", "1");
      router.push(`?${params.toString()}`);
    } else {
      onApply?.(next);
    }

    onClose();
  };

  const handleClearFilters = () => {
    if (mode === "url") {
      const params = new URLSearchParams();
      mergePreservedShopParams(params, searchParams);
      const qs = params.toString();
      router.push(qs ? `/shop?${qs}` : "/shop");
    } else {
      onClear?.();
    }

    onClose();
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="fixed inset-y-0 right-0 flex h-[100dvh] w-full max-w-md flex-col overflow-hidden bg-white shadow-2xl sm:w-[28.5rem]"
            role="dialog"
            aria-modal="true"
            aria-label="Product Filters"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={variants}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 pb-4 pt-6 sm:px-5">
              <Paragraph1 className="text-sm font-semibold uppercase tracking-wide text-gray-900">
                Filters
              </Paragraph1>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-black"
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-8 overflow-y-auto px-4 py-5 sm:px-5">
              {!hideSearch ? (
                <div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search listings..."
                      value={localFilters.search}
                      onChange={(e) =>
                        setLocalFilters({
                          ...localFilters,
                          search: e.target.value,
                        })
                      }
                      className="h-11 w-full rounded-xl border border-gray-300 py-2 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                    />
                    <Search
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  </div>
                </div>
              ) : null}

              <section ref={categorySectionRef}>
                <Paragraph1 className={filterSectionTitle}>
                  Primary Categories
                </Paragraph1>
                <div className="mb-2">
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className={filterSearchInput}
                  />
                </div>
                {optionsLoading ? (
                  <Paragraph1>Loading...</Paragraph1>
                ) : optionsError ? (
                  <Paragraph1 className="text-red-500">
                    Failed to load categories
                  </Paragraph1>
                ) : filterOptions.categories.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {filterOptions.categories
                      .filter((cat) =>
                        cat.name
                          .toLowerCase()
                          .includes(categorySearch.toLowerCase()),
                      )
                      .map((cat) => (
                        <label
                          key={cat.id}
                          className={filterOptionLabel}
                        >
                          <input
                            type="checkbox"
                            checked={listOrEmpty(localFilters.category).includes(cat.id)}
                            onChange={(e) =>
                              setLocalFilters({
                                ...localFilters,
                                category: toggleList(
                                  listOrEmpty(localFilters.category),
                                  cat.id,
                                  e.target.checked,
                                ),
                              })
                            }
                            className={filterCheckbox}
                          />
                          <Paragraph1>{cat.name}</Paragraph1>
                        </label>
                      ))}
                  </div>
                ) : (
                  <Paragraph1 className="text-gray-500 text-sm">
                    No categories in current listings
                  </Paragraph1>
                )}
              </section>

              <section>
                <Paragraph1 className={filterSectionTitle}>
                  Subcategories
                </Paragraph1>
                <div className="mb-2">
                  <input
                    type="text"
                    placeholder="Search subcategories..."
                    value={tagSearch}
                    onChange={(e) => setTagSearch(e.target.value)}
                    className={filterSearchInput}
                  />
                </div>
                {optionsLoading ? (
                  <Paragraph1>Loading...</Paragraph1>
                ) : optionsError ? (
                  <Paragraph1 className="text-red-500">
                    Failed to load subcategories
                  </Paragraph1>
                ) : filterOptions.tags.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {filterOptions.tags
                      .filter((tag) =>
                        tag.name.toLowerCase().includes(tagSearch.toLowerCase()),
                      )
                      .map((tag) => (
                        <label
                          key={tag.id}
                          className={filterOptionLabel}
                        >
                          <input
                            type="checkbox"
                            checked={listOrEmpty(localFilters.tags).includes(tag.name)}
                            onChange={(e) =>
                              setLocalFilters({
                                ...localFilters,
                                tags: toggleList(
                                  listOrEmpty(localFilters.tags),
                                  tag.name,
                                  e.target.checked,
                                ),
                              })
                            }
                            className={filterCheckbox}
                          />
                          <Paragraph1>{tag.name}</Paragraph1>
                        </label>
                      ))}
                  </div>
                ) : (
                  <Paragraph1 className="text-gray-500 text-sm">
                    No subcategories in current listings
                  </Paragraph1>
                )}
              </section>

              <section>
                <Paragraph1 className={filterSectionTitle}>
                  Brands
                </Paragraph1>
                <div className="mb-2">
                  <input
                    type="text"
                    placeholder="Search brands..."
                    value={brandSearch}
                    onChange={(e) => setBrandSearch(e.target.value)}
                    className={filterSearchInput}
                  />
                </div>
                {optionsLoading ? (
                  <Paragraph1>Loading...</Paragraph1>
                ) : optionsError ? (
                  <Paragraph1 className="text-red-500">
                    Failed to load brands
                  </Paragraph1>
                ) : filterOptions.brands.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {filterOptions.brands
                      .filter((brand) =>
                        brand.name
                          .toLowerCase()
                          .includes(brandSearch.toLowerCase()),
                      )
                      .map((brand) => (
                        <label
                          key={brand.id}
                          className={filterOptionLabel}
                        >
                          <input
                            type="checkbox"
                            checked={listOrEmpty(localFilters.brand).includes(brand.name)}
                            onChange={(e) =>
                              setLocalFilters({
                                ...localFilters,
                                brand: toggleList(
                                  listOrEmpty(localFilters.brand),
                                  brand.name,
                                  e.target.checked,
                                ),
                              })
                            }
                            className={filterCheckbox}
                          />
                          <Paragraph1>{brand.name}</Paragraph1>
                        </label>
                      ))}
                  </div>
                ) : (
                  <Paragraph1 className="text-gray-500 text-sm">
                    No brands in current listings
                  </Paragraph1>
                )}
              </section>

              <section>
                <Paragraph1 className={filterSectionTitle}>
                  Listers
                </Paragraph1>
                <div className="mb-2">
                  <input
                    type="text"
                    placeholder="Search listers..."
                    value={listerSearch}
                    onChange={(e) => setListerSearch(e.target.value)}
                    className={filterSearchInput}
                  />
                </div>
                {optionsLoading ? (
                  <Paragraph1>Loading...</Paragraph1>
                ) : optionsError ? (
                  <Paragraph1 className="text-red-500">
                    Failed to load listers
                  </Paragraph1>
                ) : filterOptions.listers.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {filterOptions.listers
                      .filter((user) =>
                        user.name
                          .toLowerCase()
                          .includes(listerSearch.toLowerCase()),
                      )
                      .map((user) => (
                        <label
                          key={user.id}
                          className={filterOptionLabel}
                        >
                          <input
                            type="checkbox"
                            checked={listOrEmpty(localFilters.lister).includes(user.id)}
                            onChange={(e) =>
                              setLocalFilters({
                                ...localFilters,
                                lister: toggleList(
                                  listOrEmpty(localFilters.lister),
                                  user.id,
                                  e.target.checked,
                                ),
                              })
                            }
                            className={filterCheckbox}
                          />
                          <Paragraph1>{user.name}</Paragraph1>
                        </label>
                      ))}
                  </div>
                ) : (
                  <Paragraph1 className="text-gray-500 text-sm">
                    No listers in current listings
                  </Paragraph1>
                )}
              </section>

              <section>
                <Paragraph1 className={filterSectionTitle}>
                  Listing type
                </Paragraph1>
                {optionsLoading ? (
                  <Paragraph1>Loading...</Paragraph1>
                ) : filterOptions.listingTypes.length > 0 ? (
                  filterOptions.listingTypes.map((item) => (
                    <label
                      key={item.value}
                      className={filterOptionLabel}
                    >
                      <input
                        type="checkbox"
                        checked={(localFilters.listingTypes ?? []).includes(
                          item.value,
                        )}
                        onChange={(e) =>
                          setLocalFilters({
                            ...localFilters,
                            listingTypes: toggleList(
                              localFilters.listingTypes ?? [],
                              item.value,
                              e.target.checked,
                            ),
                          })
                        }
                        className={filterCheckbox}
                      />
                      <Paragraph1>{item.label}</Paragraph1>
                    </label>
                  ))
                ) : (
                  <Paragraph1 className="text-gray-500 text-sm">
                    No listing types in current listings
                  </Paragraph1>
                )}
              </section>

              <section ref={sizeSectionRef}>
                <Paragraph1 className={filterSectionTitle}>
                  Size
                </Paragraph1>
                {optionsLoading ? (
                  <Paragraph1>Loading...</Paragraph1>
                ) : filterOptions.sizes.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {filterOptions.sizes.map((item) => (
                    <label
                      key={item}
                      className={filterOptionLabel}
                    >
                      <input
                        type="checkbox"
                        checked={listOrEmpty(localFilters.size).includes(item)}
                        onChange={(e) =>
                          setLocalFilters({
                            ...localFilters,
                            size: toggleList(
                              listOrEmpty(localFilters.size),
                              item,
                              e.target.checked,
                            ),
                          })
                        }
                        className={filterCheckbox}
                      />
                      <Paragraph1>{item}</Paragraph1>
                    </label>
                  ))}
                  </div>
                ) : (
                  <Paragraph1 className="text-gray-500 text-sm">
                    No sizes in current listings
                  </Paragraph1>
                )}
              </section>

              <section>
                <Paragraph1 className={filterSectionTitle}>
                  Color
                </Paragraph1>
                {optionsLoading ? (
                  <Paragraph1>Loading...</Paragraph1>
                ) : filterOptions.colors.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {filterOptions.colors.map((item) => (
                      <label
                        key={item}
                        className={filterOptionLabel}
                      >
                        <input
                          type="checkbox"
                          checked={listOrEmpty(localFilters.color).includes(item)}
                          onChange={(e) =>
                            setLocalFilters({
                              ...localFilters,
                              color: toggleList(
                                listOrEmpty(localFilters.color),
                                item,
                                e.target.checked,
                              ),
                            })
                          }
                          className={filterCheckbox}
                        />
                        <Paragraph1>{item}</Paragraph1>
                      </label>
                    ))}
                  </div>
                ) : (
                  <Paragraph1 className="text-gray-500 text-sm">
                    No colors in current listings
                  </Paragraph1>
                )}
              </section>

              <section>
                <Paragraph1 className={filterSectionTitle}>
                  Condition
                </Paragraph1>
                {optionsLoading ? (
                  <Paragraph1>Loading...</Paragraph1>
                ) : filterOptions.conditions.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {filterOptions.conditions.map((item) => (
                      <label
                        key={item}
                        className={filterOptionLabel}
                      >
                        <input
                          type="radio"
                          name="condition"
                          value={item}
                          checked={localFilters.condition === item}
                          onChange={(e) =>
                            setLocalFilters({
                              ...localFilters,
                              condition: e.target.value,
                            })
                          }
                          className={filterRadio}
                        />
                        <Paragraph1>{item}</Paragraph1>
                      </label>
                    ))}
                  </div>
                ) : (
                  <Paragraph1 className="text-gray-500 text-sm">
                    No conditions in current listings
                  </Paragraph1>
                )}
              </section>

              <section>
                <Paragraph1 className={filterSectionTitle}>
                  Material
                </Paragraph1>
                {optionsLoading ? (
                  <Paragraph1>Loading...</Paragraph1>
                ) : filterOptions.materials.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {filterOptions.materials.map((item) => (
                      <label
                        key={item}
                        className={filterOptionLabel}
                      >
                        <input
                          type="radio"
                          name="material"
                          value={item}
                          checked={localFilters.material === item}
                          onChange={(e) =>
                            setLocalFilters({
                              ...localFilters,
                              material: e.target.value,
                            })
                          }
                          className={filterRadio}
                        />
                        <Paragraph1>{item}</Paragraph1>
                      </label>
                    ))}
                  </div>
                ) : (
                  <Paragraph1 className="text-gray-500 text-sm">
                    No materials in current listings
                  </Paragraph1>
                )}
              </section>

              <PriceFilterInputs
                minPrice={localFilters.minPrice}
                maxPrice={localFilters.maxPrice}
                onChange={({ minPrice, maxPrice }) =>
                  setLocalFilters({ ...localFilters, minPrice, maxPrice })
                }
              />
            </div>

            <div className={slidePanelActionsFooter}>
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-gray-300 bg-white text-sm font-semibold text-gray-900 transition hover:border-gray-400 hover:bg-gray-50"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={handleApplyFilters}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-black text-sm font-semibold text-white transition hover:bg-gray-900"
              >
                <SlidersVertical size={16} aria-hidden />
                Apply
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
