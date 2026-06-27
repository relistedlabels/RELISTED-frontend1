"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { FormSkeleton } from "@/common/ui/SkeletonLoaders";
import { useAllBrands } from "@/lib/queries/admin/useListings";
import {
  usePrioritizedShopBrands,
  useSetPrioritizedShopBrands,
} from "@/lib/queries/admin/useShopPrioritizedBrands";

export default function ShopBrandPriorityPanel() {
  const { data: brands, isLoading: brandsLoading } = useAllBrands();
  const {
    data: prioritizedResponse,
    isLoading: prioritizedLoading,
    error,
  } = usePrioritizedShopBrands();
  const setPrioritizedBrands = useSetPrioritizedShopBrands();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const savedBrandIds = useMemo(
    () => prioritizedResponse?.data?.brandIds ?? [],
    [prioritizedResponse],
  );

  useEffect(() => {
    setSelectedIds(new Set(savedBrandIds));
  }, [savedBrandIds]);

  const hasChanges = useMemo(() => {
    if (selectedIds.size !== savedBrandIds.length) return true;
    return savedBrandIds.some((id) => !selectedIds.has(id));
  }, [selectedIds, savedBrandIds]);

  const filteredBrands = useMemo(() => {
    const list = brands ?? [];
    const query = searchQuery.trim().toLowerCase();
    const filtered = query
      ? list.filter((brand) => brand.name.toLowerCase().includes(query))
      : list;
    const prioritySet = new Set(savedBrandIds);
    return [...filtered].sort((a, b) => {
      const aPrioritized = prioritySet.has(a.id);
      const bPrioritized = prioritySet.has(b.id);
      if (aPrioritized !== bPrioritized) {
        return aPrioritized ? -1 : 1;
      }
      return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    });
  }, [brands, searchQuery, savedBrandIds]);

  const toggleBrand = (brandId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(brandId)) {
        next.delete(brandId);
      } else {
        next.add(brandId);
      }
      return next;
    });
  };

  const handleSave = () => {
    setPrioritizedBrands.mutate(Array.from(selectedIds), {
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
        Select brands to feature first on the shop page. Items from these brands
        appear before all other listings, sorted by creation time.
      </Paragraph1>

      {showSkeleton ? (
        <FormSkeleton fields={4} />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4">
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
            <Paragraph1 className="text-sm text-gray-500">
              {selectedIds.size} selected
            </Paragraph1>
          </div>

          <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
            {filteredBrands.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">No brands found.</div>
            ) : (
              filteredBrands.map((brand) => {
                const isSelected = selectedIds.has(brand.id);
                return (
                  <label
                    key={brand.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleBrand(brand.id)}
                      className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                    />
                    <span className="text-sm text-gray-900">{brand.name}</span>
                    {isSelected && (
                      <span className="ml-auto text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                        Prioritized
                      </span>
                    )}
                  </label>
                );
              })
            )}
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
                onClick={() => setSelectedIds(new Set(savedBrandIds))}
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
