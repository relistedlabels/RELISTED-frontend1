"use client";

import { Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { FormSkeleton } from "@/common/ui/SkeletonLoaders";
import { Paragraph1 } from "@/common/ui/Text";
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
        toast.success("Brand created. Save to publish.");
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
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Site brands</h2>
          <Paragraph1 className="mt-1 text-sm text-gray-500">
            Choose which brands appear in the shop.
          </Paragraph1>
        </div>
        {!showSkeleton ? (
          <span className="inline-flex w-fit rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium tabular-nums text-gray-600">
            {selectedIds.length} of {brands.length} visible
          </span>
        ) : null}
      </div>

      {showSkeleton ? (
        <div className="p-5">
          <FormSkeleton fields={4} />
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="relative w-full sm:max-w-xs">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search brands"
                placeholder="Search brands..."
                className="h-10 w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
            </div>
          </div>

          <div className="mx-4 my-4 max-h-72 overflow-y-auto rounded-xl border border-gray-200 divide-y divide-gray-100 sm:mx-5">
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
                    className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleBrand(brand.id)}
                      className="h-4 w-4 rounded border-gray-300 accent-gray-900"
                    />
                    <span className="text-sm text-gray-900">{brand.name}</span>
                  </label>
                );
              })
            )}
          </div>

          <div className="border-t border-gray-100 px-4 py-4 sm:px-5">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">
              Add a brand
            </h3>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                placeholder="Brand name"
                aria-label="New brand name"
                className="h-10 min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
              <button
                type="button"
                onClick={handleCreateBrand}
                disabled={!newBrandName.trim() || createBrand.isPending}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus size={16} />
                {createBrand.isPending ? "Creating..." : "Create brand"}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-gray-100 bg-gray-50/70 px-4 py-4 sm:px-5">
            <button
              type="button"
              onClick={handleSave}
              disabled={!hasChanges || setVisibleBrands.isPending}
              className="h-10 rounded-lg bg-gray-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {setVisibleBrands.isPending ? "Saving..." : "Save changes"}
            </button>
            {hasChanges && (
              <button
                type="button"
                onClick={() => setSelectedIds(savedBrandIds)}
                disabled={setVisibleBrands.isPending}
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
