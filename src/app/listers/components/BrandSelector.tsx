// components/BrandSelector.tsx
"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown, Check } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import { useBrands } from "@/lib/queries/brand/useBrands";
import { useProductDraftStore } from "@/store/useProductDraftStore";

interface Brand {
  id: string;
  name: string;
  createdAt?: string;
  userId?: string;
}

export const BrandSelector: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const { data: brands = [] } = useBrands();
  const { data, setField } = useProductDraftStore();

  // Filter brands based on search query
  const filtered = useMemo(
    () =>
      (brands as Brand[]).filter((b) =>
        b.name.toLowerCase().includes(query.toLowerCase())
      ),
    [brands, query]
  );

  // Selected brand from store
  const selectedBrand = (brands as Brand[]).find(
    (b) => b.id === data.brandId
  );

  return (
    <div className="relative w-full">
      <Paragraph1 className="mb-1 text-xs font-medium text-gray-700">
        Brand / Designer
      </Paragraph1>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-black"
      >
        <span className={selectedBrand ? "text-black" : "text-gray-400"}>
          {selectedBrand?.name ?? "Select brand"}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-sm">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search brand..."
            className="w-full border-b border-gray-100 px-3 py-2 text-sm outline-none"
          />

          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 && (
              <p className="px-3 py-2 text-sm text-gray-400">No brands found</p>
            )}

            {filtered.map((brand: Brand) => (
              <button
                key={brand.id}
                type="button"
                onClick={() => {
                  setField("brandId", brand.id); // store selected brand in product draft
                  setOpen(false);
                  setQuery("");
                }}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-50"
              >
                {brand.name}
                {selectedBrand?.id === brand.id && (
                  <Check className="h-4 w-4 text-black" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
