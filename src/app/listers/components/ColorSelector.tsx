"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown, Check } from "lucide-react";
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
];

export const ColorSelector: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { data, setField } = useProductDraftStore();

 
  const selected = useMemo(
    () => COLORS.find((c) => c.name === data.color) ?? null,
    [data.color],
  );

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
          {COLORS.map((color) => {
            const isSelected = data.color === color.name;

            return (
              <button
                key={color.name}
                onClick={() => {
                  setField("color", color.name); // ✅ string
                  setOpen(false);
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
          })}
        </div>
      )}
    </div>
  );
}
