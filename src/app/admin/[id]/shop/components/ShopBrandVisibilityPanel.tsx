"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { FormSkeleton } from "@/common/ui/SkeletonLoaders";
import { useCreateBrand } from "@/lib/queries/admin/useListings";
import {
  useSetVisibleShopBrands,
  useVisibleShopBrands,
} from "@/lib/queries/admin/useShopVisibleBrands";

export default function ShopBrandVisibilityPanel() {
  const { data: visibleResponse, isLoading, error } = useVisibleShopBrands();
  const setVisibleBrands = useSetVisibleShopBrands();
  const createBrand = useCreateBrand();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newBrandName, setNewBrandName] = useState("");

  const savedBrandIds = useMemo(
    () => visibleResponse?.data?.visibleBrandIds ?? [],
    [visibleResponse],
  );

  const brands = useMemo(
    () => visibleResponse?.data?.brands ?? [],
    [visibleResponse],
  );

  useEffect(() => {
    setSelectedIds(savedBrandIds);
  }, [savedBrandIds]);

  const hasChanges = useMemo(() => {
    if (selectedIds.length !== savedBrandIds.length) return true;
    const savedSet = new Set(savedBrandIds);
    return selectedIds.some((id) => !savedSet.has(id));
  }, [selectedIds, savedBrandIds]);

  const filteredBrands = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const list = query
      ? brands.filter((brand) => brand.name.toLowerCase().includes(query))
      : brands;
    return [...list].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
    );
  }, [brands, searchQuery]);

  const toggleBrand = (brandId: string) => {
    setSelectedIds((prev) =>
      prev.includes(brandId)
        ? prev.filter((id) => id !== brandId)
        : [...prev, brandId],
    );
  };

  const handleCreateBrand = () => {
    const name = newBrandName.trim();
    if (!name) return;

    createBrand.mutate(name, {
      onSuccess: (created) => {
        const brandId =
          (created as { data?: { id?: string }; id?: string })?.data?.id ??
          (created as { id?: string })?.id;
        if (brandId) {
          setSelectedIds((prev) =>
            prev.includes(brandId) ? prev : [...prev, brandId],
          );
        }
        setNewBrandName("");
        toast.success("Brand created. Save changes to publish it on the site.");
      },
      onError: (err: unknown) => {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Failed to create brand";
        toast.error(message);
      },
    });
  };

  const handleSave = () => {
    setVisibleBrands.mutate(selectedIds, {
      onSuccess: (response) => {
        const warnings = response.warnings ?? [];
        if (warnings.length > 0) {
          const summary = warnings
            .map(
              (warning) =>
                `${warning.brandName}: ${warning.rentedSkipped} active rental${
                  warning.rentedSkipped === 1 ? "" : "s"
                } skipped`,
            )
            .join(". ");
          toast.success("Site brands updated", {
            description: summary,
          });
        } else {
          toast.success("Site brands updated");
        }
      },
      onError: (err: unknown) => {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Failed to update site brands";
        toast.error(message);
      },
    });
  };

  const showSkeleton = isLoading || Boolean(error);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <Paragraph3 className="text-gray-900 mb-1">Site brands</Paragraph3>
      <Paragraph1 className="text-sm text-gray-600 mb-6">
        Choose which brands appear on the site and in the lister brand picker.
        Removing a brand deactivates its listings. Active rentals stay until
        returned.
      </Paragraph1>

      {showSkeleton ? (
        <FormSkeleton fields={4} />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4">
            <Paragraph3 className="text-sm text-gray-900">
              {selectedIds.length} of {brands.length} brands visible
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

          <div className="max-h-72 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100 mb-6">
            {filteredBrands.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">
                {searchQuery.trim() ? "No matching brands." : "No brands yet."}
              </div>
            ) : (
              filteredBrands.map((brand) => {
                const checked = selectedIds.includes(brand.id);
                return (
                  <label
                    key={brand.id}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleBrand(brand.id)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-900">{brand.name}</span>
                  </label>
                );
              })
            )}
          </div>

          <div className="border-t border-gray-100 pt-4 mb-6">
            <Paragraph3 className="text-sm text-gray-900 mb-2">
              Add a new brand
            </Paragraph3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                placeholder="Brand name"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
              />
              <button
                type="button"
                onClick={handleCreateBrand}
                disabled={!newBrandName.trim() || createBrand.isPending}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <Plus size={16} />
                {createBrand.isPending ? "Creating..." : "Create brand"}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={!hasChanges || setVisibleBrands.isPending}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {setVisibleBrands.isPending ? "Saving..." : "Save changes"}
            </button>
            {hasChanges && (
              <button
                onClick={() => setSelectedIds(savedBrandIds)}
                disabled={setVisibleBrands.isPending}
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
