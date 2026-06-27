"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search, SlidersVertical, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { Paragraph1 } from "@/common/ui/Text";
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

export type ListingFilterPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  mode?: "url" | "controlled";
  value?: ListingFilterValues;
  onApply?: (filters: ListingFilterValues) => void;
  onClear?: () => void;
  hideSearch?: boolean;
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

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-99 bg-black/70 backdrop--blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="fixed top-0 right-0 h-screen hide-scrollbar overflow-y-auto bg-white shadow-2xl px-4 flex flex-col w-full sm:w-94"
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
            <div className="flex justify-between sticky top-0 items-center pb-4 border-b border-gray-100 pt-6 z-10 bg-white">
              <Paragraph1 className="font-bold tracking-widest text-gray-800">
                FILTERS
              </Paragraph1>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-500 hover:text-black p-1 rounded-full transition"
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grow pt-4 pb-20 space-y-8">
              {!hideSearch ? (
                <div className="mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search"
                      value={localFilters.search}
                      onChange={(e) =>
                        setLocalFilters({
                          ...localFilters,
                          search: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-4 py-3 border-gray-100 bg-gray-100 outline-none"
                    />
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                  </div>
                </div>
              ) : null}

              <section>
                <Paragraph1 className="uppercase font-bold text-xs mb-3 text-gray-800">
                  Primary Categories
                </Paragraph1>
                <div className="mb-2">
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded mb-1 text-sm"
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
                          className="flex items-center space-x-2 py-1 cursor-pointer select-none text-sm text-gray-700 hover:text-gray-900"
                        >
                          <input
                            type="checkbox"
                            checked={localFilters.category.includes(cat.id)}
                            onChange={(e) =>
                              setLocalFilters({
                                ...localFilters,
                                category: toggleList(
                                  localFilters.category,
                                  cat.id,
                                  e.target.checked,
                                ),
                              })
                            }
                            className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
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
                <Paragraph1 className="uppercase font-bold text-xs mb-3 text-gray-800">
                  Subcategories
                </Paragraph1>
                <div className="mb-2">
                  <input
                    type="text"
                    placeholder="Search subcategories..."
                    value={tagSearch}
                    onChange={(e) => setTagSearch(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded mb-1 text-sm"
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
                          className="flex items-center space-x-2 py-1 cursor-pointer select-none text-sm text-gray-700 hover:text-gray-900"
                        >
                          <input
                            type="checkbox"
                            checked={localFilters.tags.includes(tag.name)}
                            onChange={(e) =>
                              setLocalFilters({
                                ...localFilters,
                                tags: toggleList(
                                  localFilters.tags,
                                  tag.name,
                                  e.target.checked,
                                ),
                              })
                            }
                            className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
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
                <Paragraph1 className="uppercase font-bold text-xs mb-3 text-gray-800">
                  Brands
                </Paragraph1>
                <div className="mb-2">
                  <input
                    type="text"
                    placeholder="Search brands..."
                    value={brandSearch}
                    onChange={(e) => setBrandSearch(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded mb-1 text-sm"
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
                          className="flex items-center space-x-2 py-1 cursor-pointer select-none text-sm text-gray-700 hover:text-gray-900"
                        >
                          <input
                            type="checkbox"
                            checked={localFilters.brand.includes(brand.name)}
                            onChange={(e) =>
                              setLocalFilters({
                                ...localFilters,
                                brand: toggleList(
                                  localFilters.brand,
                                  brand.name,
                                  e.target.checked,
                                ),
                              })
                            }
                            className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
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
                <Paragraph1 className="uppercase font-bold text-xs mb-3 text-gray-800">
                  Listers
                </Paragraph1>
                <div className="mb-2">
                  <input
                    type="text"
                    placeholder="Search listers..."
                    value={listerSearch}
                    onChange={(e) => setListerSearch(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded mb-1 text-sm"
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
                          className="flex items-center space-x-2 py-1 cursor-pointer select-none text-sm text-gray-700 hover:text-gray-900"
                        >
                          <input
                            type="checkbox"
                            checked={localFilters.lister.includes(user.id)}
                            onChange={(e) =>
                              setLocalFilters({
                                ...localFilters,
                                lister: toggleList(
                                  localFilters.lister,
                                  user.id,
                                  e.target.checked,
                                ),
                              })
                            }
                            className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
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
                <Paragraph1 className="uppercase font-bold text-xs mb-3 text-gray-800">
                  Listing type
                </Paragraph1>
                {optionsLoading ? (
                  <Paragraph1>Loading...</Paragraph1>
                ) : filterOptions.listingTypes.length > 0 ? (
                  filterOptions.listingTypes.map((item) => (
                    <label
                      key={item.value}
                      className="flex items-center space-x-2 py-1 cursor-pointer select-none text-sm text-gray-700 hover:text-gray-900"
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
                        className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
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

              <section>
                <Paragraph1 className="uppercase font-bold text-xs mb-3 text-gray-800">
                  Size
                </Paragraph1>
                {optionsLoading ? (
                  <Paragraph1>Loading...</Paragraph1>
                ) : filterOptions.sizes.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {filterOptions.sizes.map((item) => (
                    <label
                      key={item}
                      className="flex items-center space-x-2 py-1 cursor-pointer select-none text-sm text-gray-700 hover:text-gray-900"
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
                        className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
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
                <Paragraph1 className="uppercase font-bold text-xs mb-3 text-gray-800">
                  Color
                </Paragraph1>
                {optionsLoading ? (
                  <Paragraph1>Loading...</Paragraph1>
                ) : filterOptions.colors.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {filterOptions.colors.map((item) => (
                      <label
                        key={item}
                        className="flex items-center space-x-2 py-1 cursor-pointer select-none text-sm text-gray-700 hover:text-gray-900"
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
                          className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
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
                <Paragraph1 className="uppercase font-bold text-xs mb-3 text-gray-800">
                  Condition
                </Paragraph1>
                {optionsLoading ? (
                  <Paragraph1>Loading...</Paragraph1>
                ) : filterOptions.conditions.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {filterOptions.conditions.map((item) => (
                      <label
                        key={item}
                        className="flex items-center space-x-2 py-1 cursor-pointer select-none text-sm text-gray-700 hover:text-gray-900"
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
                          className="h-4 w-4 text-black border-gray-300 rounded-full focus:ring-black"
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
                <Paragraph1 className="uppercase font-bold text-xs mb-3 text-gray-800">
                  Material
                </Paragraph1>
                {optionsLoading ? (
                  <Paragraph1>Loading...</Paragraph1>
                ) : filterOptions.materials.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {filterOptions.materials.map((item) => (
                      <label
                        key={item}
                        className="flex items-center space-x-2 py-1 cursor-pointer select-none text-sm text-gray-700 hover:text-gray-900"
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
                          className="h-4 w-4 text-black border-gray-300 rounded-full focus:ring-black"
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

            <div className="mt-auto py-2 bg-white flex justify-between gap-4 sticky bottom-0">
              <button
                type="button"
                onClick={handleClearFilters}
                className="flex-1 px-4 py-3 text-sm font-semibold border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <Paragraph1>Clear Filters</Paragraph1>
              </button>
              <button
                type="button"
                onClick={handleApplyFilters}
                className="flex-1 px-4 py-3 text-sm font-semibold bg-black text-white rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2"
              >
                <SlidersVertical size={16} />
                <Paragraph1>Apply Filters</Paragraph1>
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
