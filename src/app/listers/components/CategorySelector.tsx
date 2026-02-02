// components/CategorySelector.tsx
"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown, Check } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import { useCategory } from "@/lib/queries/category/useCategories";
import { useProductDraftStore } from "@/store/useProductDraftStore";

// Match your backend schema
interface Category {
  id: string;
  name: string;
  userId?: string;
  createdAt?: string;
}

export const CategorySelector: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  // fetch categories from backend
  const { data: categories = [] } = useCategory();
  const { data, setField } = useProductDraftStore(); 

  // filter by search
  const filtered = useMemo(
    () =>
      (categories as Category[]).filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase())
      ),
    [categories, query]
  );

  // find currently selected category in store
  const selectedCategory = (categories as Category[]).find(
    (c) => c.id === data.categoryId
  );

  return (
    <div className="relative w-full">
      <Paragraph1 className="mb-1 text-xs font-medium text-gray-700">
        Category
      </Paragraph1>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-black"
      >
        <span className={selectedCategory ? "text-black" : "text-gray-400"}>
          {selectedCategory?.name ?? "Select category"}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-sm">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search category..."
            className="w-full border-b border-gray-100 px-3 py-2 text-sm outline-none"
          />

          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 && (
              <p className="px-3 py-2 text-sm text-gray-400">
                No categories found
              </p>
            )}

            {filtered.map((category: Category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => {
                  // store full category object in draft
                  setField("categoryId", category.id);
                  setOpen(false);
                  setQuery("");
                }}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-50"
              >
                {category.name}
                {selectedCategory?.id === category.id && (
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
