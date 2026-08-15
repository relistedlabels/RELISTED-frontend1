"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { FormSkeleton } from "@/common/ui/SkeletonLoaders";
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
    const list = (brands ?? []).filter((brand) => !prioritizedSet.has(brand.id));
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
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <Paragraph3 className="text-gray-900 mb-1">Brand priority</Paragraph3>
      <Paragraph1 className="text-sm text-gray-600 mb-6">
        Choose which brands appear first on the shop page and set their order.
        Items from the top brand appear before the next, then all other listings.
      </Paragraph1>

      {showSkeleton ? (
        <FormSkeleton fields={4} />
      ) : (
        <>
          <div className="mb-6">
            <Paragraph3 className="text-sm text-gray-900 mb-2">
              Priority order
            </Paragraph3>
            {orderedIds.length === 0 ? (
              <div className="border border-dashed border-gray-200 rounded-lg p-4 text-sm text-gray-500">
                No brands prioritized yet. Add brands below.
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
                {orderedIds.map((brandId, index) => {
                  const brand = brandById.get(brandId);
                  if (!brand) return null;
                  return (
                    <div
                      key={brandId}
                      className="flex items-center gap-2 px-3 py-2.5"
                    >
                      <span className="w-6 text-xs font-medium text-gray-400 text-center">
                        {index + 1}
                      </span>
                      <span className="flex-1 text-sm text-gray-900">
                        {brand.name}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveBrand(index, "up")}
                          disabled={index === 0}
                          className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label={`Move ${brand.name} up`}
                        >
                          <ChevronUp size={16} className="text-gray-600" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveBrand(index, "down")}
                          disabled={index === orderedIds.length - 1}
                          className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label={`Move ${brand.name} down`}
                        >
                          <ChevronDown size={16} className="text-gray-600" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeBrand(brandId)}
                          className="p-1 rounded hover:bg-gray-100"
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

          <div>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-3">
              <Paragraph3 className="text-sm text-gray-900">
                Add brands
              </Paragraph3>
              <div className="relative w-full sm:max-w-xs">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search brands..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
                />
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
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
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
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

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={!hasChanges || setPrioritizedBrands.isPending}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {setPrioritizedBrands.isPending ? "Saving..." : "Save changes"}
            </button>
            {hasChanges && (
              <button
                onClick={() => setOrderedIds(savedBrandIds)}
                disabled={setPrioritizedBrands.isPending}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 disabled:opacity-50"
              >
                Reset
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
