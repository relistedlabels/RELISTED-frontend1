"use client";

import { ChevronDown, ChevronUp, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { FormSkeleton } from "@/common/ui/SkeletonLoaders";
import { Paragraph1 } from "@/common/ui/Text";
import { useAllBrands } from "@/lib/queries/admin/useListings";
import {
  usePrioritizedShopBrands,
  useSetPrioritizedShopBrands,
} from "@/lib/queries/admin/useShopPrioritizedBrands";

function moveItem<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (toIndex < 0 || toIndex >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

export default function ShopBrandPriorityPanel() {
  const { data: brands, isLoading: brandsLoading } = useAllBrands();
  const {
    data: prioritizedResponse,
    isLoading: prioritizedLoading,
    error,
  } = usePrioritizedShopBrands();
  const setPrioritizedBrands = useSetPrioritizedShopBrands();

  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const savedBrandIds = useMemo(
    () => prioritizedResponse?.data?.brandIds ?? [],
    [prioritizedResponse],
  );

  const brandById = useMemo(
    () => new Map((brands ?? []).map((brand) => [brand.id, brand])),
    [brands],
  );

  useEffect(() => {
    setOrderedIds(savedBrandIds);
  }, [savedBrandIds]);

  const hasChanges = useMemo(() => {
    if (orderedIds.length !== savedBrandIds.length) return true;
    return orderedIds.some((id, index) => id !== savedBrandIds[index]);
  }, [orderedIds, savedBrandIds]);

  const prioritizedSet = useMemo(() => new Set(orderedIds), [orderedIds]);

  const availableBrands = useMemo(() => {
    const list = (brands ?? []).filter(
      (brand) => brand.isShopVisible !== false && !prioritizedSet.has(brand.id),
    );
    const query = searchQuery.trim().toLowerCase();
    const filtered = query
      ? list.filter((brand) => brand.name.toLowerCase().includes(query))
      : list;
    return [...filtered].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
    );
  }, [brands, prioritizedSet, searchQuery]);

  const addBrand = (brandId: string) => {
    setOrderedIds((prev) => [...prev, brandId]);
  };

  const removeBrand = (brandId: string) => {
    setOrderedIds((prev) => prev.filter((id) => id !== brandId));
  };

  const moveBrand = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    setOrderedIds((prev) => moveItem(prev, index, targetIndex));
  };

  const handleSave = () => {
    setPrioritizedBrands.mutate(orderedIds, {
      onSuccess: () => {
        toast.success("Shop brand priority updated");
      },
      onError: (err: unknown) => {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Failed to update shop brand priority";
        toast.error(message);
      },
    });
  };

  const isLoading = brandsLoading || prioritizedLoading;
  const showSkeleton = isLoading || Boolean(error);

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">
            Brand priority
          </h2>
          <Paragraph1 className="mt-1 text-sm text-gray-500">
            Set the order brands appear in the shop.
          </Paragraph1>
        </div>
        {!showSkeleton ? (
          <span className="inline-flex w-fit rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium tabular-nums text-gray-600">
            {orderedIds.length} prioritized
          </span>
        ) : null}
      </div>

      {showSkeleton ? (
        <div className="p-5">
          <FormSkeleton fields={4} />
        </div>
      ) : (
        <>
          <div className="border-b border-gray-100 p-4 sm:p-5">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">
              Current order
            </h3>
            {orderedIds.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-4 text-sm text-gray-500">
                No priority order set.
              </div>
            ) : (
              <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200">
                {orderedIds.map((brandId, index) => {
                  const brand = brandById.get(brandId);
                  if (!brand) return null;
                  return (
                    <div
                      key={brandId}
                      className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-gray-50/70"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gray-100 text-xs font-semibold tabular-nums text-gray-600">
                        {index + 1}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">
                        {brand.name}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveBrand(index, "up")}
                          disabled={index === 0}
                          className="rounded-md p-1.5 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
                          aria-label={`Move ${brand.name} up`}
                        >
                          <ChevronUp size={16} className="text-gray-600" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveBrand(index, "down")}
                          disabled={index === orderedIds.length - 1}
                          className="rounded-md p-1.5 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
                          aria-label={`Move ${brand.name} down`}
                        >
                          <ChevronDown size={16} className="text-gray-600" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeBrand(brandId)}
                          className="rounded-md p-1.5 transition-colors hover:bg-gray-100"
                          aria-label={`Remove ${brand.name}`}
                        >
                          <X size={16} className="text-gray-500" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-4 sm:p-5">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-sm font-semibold text-gray-900">
                Add brands
              </h3>
              <div className="relative w-full sm:max-w-xs">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search available brands"
                  placeholder="Search brands..."
                  className="h-10 w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                />
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto divide-y divide-gray-100 rounded-xl border border-gray-200">
              {availableBrands.length === 0 ? (
                <div className="p-4 text-sm text-gray-500">
                  {searchQuery.trim()
                    ? "No matching brands."
                    : "All brands are already prioritized."}
                </div>
              ) : (
                availableBrands.map((brand) => (
                  <button
                    key={brand.id}
                    type="button"
                    onClick={() => addBrand(brand.id)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-gray-50"
                  >
                    <span className="text-sm text-gray-900">{brand.name}</span>
                    <span className="text-xs font-medium text-gray-500">
                      Add
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-gray-100 bg-gray-50/70 px-4 py-4 sm:px-5">
            <button
              type="button"
              onClick={handleSave}
              disabled={!hasChanges || setPrioritizedBrands.isPending}
              className="h-10 rounded-lg bg-gray-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {setPrioritizedBrands.isPending ? "Saving..." : "Save changes"}
            </button>
            {hasChanges && (
              <button
                type="button"
                onClick={() => setOrderedIds(savedBrandIds)}
                disabled={setPrioritizedBrands.isPending}
                className="h-10 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Reset
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}
