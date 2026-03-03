"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import { useProductDraftStore } from "@/store/useProductDraftStore";

const COLORS = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Red", hex: "#E11D48" },
  { name: "Green", hex: "#16A34A" },
  { name: "Blue", hex: "#2563EB" },
  { name: "Brown", hex: "#92400E" },
  { name: "Gray", hex: "#6B7280" },
  { name: "Silver", hex: "#D1D5DB" },
  { name: "Yellow", hex: "#FACC15" },
  { name: "Orange", hex: "#F97316" },
  { name: "Purple", hex: "#7C3AED" },
  { name: "Pink", hex: "#EC4899" },
  { name: "Teal", hex: "#14B8A6" },
  { name: "Cyan", hex: "#06B6D4" },
  { name: "Indigo", hex: "#4F46E5" },
  { name: "Lime", hex: "#84CC16" },
  { name: "Amber", hex: "#F59E0B" },
  { name: "Rose", hex: "#F43F5E" },
  { name: "Navy", hex: "#0F172A" },
  { name: "Olive", hex: "#3F6212" },
  { name: "Maroon", hex: "#7F1D1D" },
  { name: "Coral", hex: "#FF7F50" },
  { name: "Salmon", hex: "#FA8072" },
  { name: "Gold", hex: "#FFD700" },
  { name: "Cream", hex: "#FFFDD0" },
  { name: "Beige", hex: "#F5F5DC" },
  { name: "Khaki", hex: "#F0E68C" },
  { name: "Tan", hex: "#D2B48C" },
  { name: "Chocolate", hex: "#D2691E" },
  { name: "Copper", hex: "#B87333" },
  { name: "Bronze", hex: "#CD7F32" },
  { name: "Charcoal", hex: "#36454F" },
  { name: "Slate", hex: "#708090" },
  { name: "Ash", hex: "#B2BEB5" },
  { name: "Lavender", hex: "#E6E6FA" },
  { name: "Violet", hex: "#EE82EE" },
  { name: "Magenta", hex: "#FF00FF" },
  { name: "Fuchsia", hex: "#FF00FF" },
  { name: "Plum", hex: "#DDA0DD" },
  { name: "Orchid", hex: "#DA70D6" },
  { name: "Mauve", hex: "#E0B0FF" },
  { name: "Turquoise", hex: "#40E0D0" },
  { name: "Aqua", hex: "#00FFFF" },
  { name: "Sky Blue", hex: "#87CEEB" },
  { name: "Steel Blue", hex: "#4682B4" },
  { name: "Midnight Blue", hex: "#191970" },
  { name: "Royal Blue", hex: "#4169E1" },
  { name: "Cornflower", hex: "#6495ED" },
  { name: "Forest Green", hex: "#228B22" },
  { name: "Lime Green", hex: "#32CD32" },
  { name: "Sea Green", hex: "#2E8B57" },
  { name: "Spring Green", hex: "#00FF7F" },
  { name: "Mint", hex: "#98FF98" },
  { name: "Emerald", hex: "#50C878" },
  { name: "Jade", hex: "#00A86B" },
  { name: "Scarlet", hex: "#FF2400" },
  { name: "Crimson", hex: "#DC143C" },
  { name: "Dark Red", hex: "#8B0000" },
  { name: "Burgundy", hex: "#800020" },
  { name: "Wine", hex: "#722F37" },
  { name: "Rust", hex: "#B7410E" },
  { name: "Terracotta", hex: "#E2725B" },
  { name: "Peach", hex: "#FFDAB9" },
  { name: "Blush", hex: "#F8B8D8" },
  { name: "Apricot", hex: "#FBCF8F" },
  { name: "Mango", hex: "#FFBF00" },
  { name: "Saffron", hex: "#F4C430" },
  { name: "Nude", hex: "#F5E6D3" },
  { name: "Taupe", hex: "#B38B6D" },
  { name: "Camel", hex: "#C19A6B" },
  { name: "Ivory", hex: "#FFFFF0" },
  { name: "Powder Blue", hex: "#B0E0E6" },
  { name: "Dusty Rose", hex: "#DCAE96" },
  { name: "Mocha", hex: "#A89060" },
  { name: "Latte", hex: "#F0C8A8" },
  { name: "Oatmeal", hex: "#F4E9DC" },
  { name: "Eggplant", hex: "#614051" },
  { name: "Sage", hex: "#9DC183" },
  { name: "Mushroom", hex: "#B3B0A3" },
  { name: "Charcoal Gray", hex: "#2F4F4F" },
  { name: "Deep Teal", hex: "#003D3D" },
  { name: "Muted Burgundy", hex: "#843D52" },
  { name: "Soft Gray", hex: "#A8A8A8" },
  { name: "Champagne", hex: "#F7E7CE" },
  { name: "Rose Gold", hex: "#F4A460" },
  { name: "Cobalt", hex: "#0047AB" },
  { name: "Teal Blue", hex: "#367588" },
  { name: "Stone", hex: "#928E85" },
];

export const ColorSelector: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data, setField } = useProductDraftStore();

  const selected = useMemo(
    () => COLORS.find((c) => c.name === data.color) ?? null,
    [data.color],
  );

  const filteredColors = useMemo(() => {
    if (!search.trim()) return COLORS;
    return COLORS.filter((color) =>
      color.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search]);

  return (
    <div className="relative w-full">
      <Paragraph1 className="mb-1 text-xs font-medium text-gray-700">
        Color
      </Paragraph1>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-black"
      >
        <span className="flex items-center gap-2">
          {selected ? (
            <>
              <span
                className="h-4 w-4 rounded-full border"
                style={{ backgroundColor: selected.hex }}
              />
              {selected.name}
            </>
          ) : (
            <span className="text-gray-400">Select color</span>
          )}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </button>

      {open && (
        <div className="absolute z-40 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-sm">
          {/* Search Bar */}
          <div className="sticky top-0 border-b border-gray-200 bg-white p-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search colors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-black focus:outline-none"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Color List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredColors.length > 0 ? (
              filteredColors.map((color) => {
                const isSelected = data.color === color.name;

                return (
                  <button
                    key={color.name}
                    onClick={() => {
                      setField("color", color.name);
                      setOpen(false);
                      setSearch("");
                    }}
                    className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="h-4 w-4 rounded-full border"
                        style={{ backgroundColor: color.hex }}
                      />
                      {color.name}
                    </span>
                    {isSelected && <Check className="h-4 w-4 text-black" />}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-4 text-center text-sm text-gray-500">
                No colors found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
