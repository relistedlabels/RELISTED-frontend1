"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import { useProductDraftStore } from "@/store/useProductDraftStore";

const SIZE_MAP: Record<string, string[]> = {
  EU: Array.from({ length: 39 }, (_, i) => {
    const size = 32 + Math.floor(i / 2);
    return i % 2 === 0 ? String(size) : String(size) + ".5";
  }),
  UK: Array.from({ length: 35 }, (_, i) => {
    const size = 1 + Math.floor(i / 2);
    return i % 2 === 0 ? String(size) : String(size) + ".5";
  }),
  US: Array.from({ length: 35 }, (_, i) => {
    const size = 2 + Math.floor(i / 2);
    return i % 2 === 0 ? String(size) : String(size) + ".5";
  }),
  International: ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "4XL", "5XL"],
};

const UNITS = ["EU", "UK", "US", "International"] as const;
type Unit = (typeof UNITS)[number];

export const SizeSelector: React.FC = () => {
  const [open, setOpen] = useState(false);

  const { data, setField } = useProductDraftStore();

  // 👇 extract from store (measurement format: "size-unit", e.g. "38-EU")
  const parsed = useMemo(() => {
    if (!data.measurement?.includes("-")) {
      return { size: null, unit: "International" as Unit };
    }
    const [size, unit] = data.measurement.split("-");
    const validUnit =
      unit && UNITS.includes(unit as Unit) ? (unit as Unit) : "International";
    return { size: size || null, unit: validUnit };
  }, [data.measurement]);

  const sizes = useMemo(
    () => SIZE_MAP[parsed.unit] ?? SIZE_MAP["UK"],
    [parsed.unit],
  );

  const commit = (size: string, unit: Unit) => {
    setField("measurement", `${size}-${unit}`);
    setOpen(false);
  };

  return (
    <div className="relative w-full">
      <Paragraph1 className="mb-2 text-xs font-semibold text-gray-800">
        Size
      </Paragraph1>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
      >
        <span
          className={
            parsed.size ? "text-gray-900 font-medium" : "text-gray-500"
          }
        >
          {parsed.size ? `${parsed.size} (${parsed.unit})` : "Select size"}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-gray-600 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-40 mt-2 w-full rounded-lg border border-gray-300 bg-white shadow-lg">
          {/* Unit selector */}
          <div className="grid grid-cols-2 gap-1 border-b border-gray-200 bg-gray-50 p-1 sm:flex">
            {UNITS.map((u) => (
              <button
                key={u}
                onClick={() => {
                  // Keep existing size if switching units
                  if (parsed.size) {
                    setField("measurement", `${parsed.size}-${u}`);
                  } else {
                    setField("measurement", "");
                  }
                }}
                className={`whitespace-nowrap rounded px-2 py-2 text-xs font-semibold transition-all duration-200 sm:flex-1 sm:rounded-none ${
                  parsed.unit === u
                    ? "border-b-2 border-blue-500 bg-white text-blue-600"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {u}
              </button>
            ))}
          </div>

          {/* Size grid */}
          <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3">
            {sizes.map((s) => (
              <button
                key={s}
                onClick={() => commit(s, parsed.unit)}
                className={`rounded-md border-2 px-2 py-2.5 text-xs font-semibold transition-all duration-200 sm:px-2.5 sm:text-sm ${
                  parsed.size === s
                    ? "border-blue-500 bg-blue-50 text-blue-600 shadow-sm"
                    : "border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
