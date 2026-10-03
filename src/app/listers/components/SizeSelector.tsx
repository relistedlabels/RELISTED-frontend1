"use client";

import { ChevronDown } from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import {
  APPAREL_SIZE_OPTIONS,
  APPAREL_SIZE_UNITS,
  type ApparelSizeUnit,
} from "@/lib/product/apparelSizes";
import { useProductDraftStore } from "@/store/useProductDraftStore";

export const SizeSelector: React.FC = () => {
  const [open, setOpen] = useState(false);

  const { data, setField } = useProductDraftStore();

  // 👇 extract from store (measurement format: "size-unit", e.g. "38-EU")
  const parsed = useMemo(() => {
    if (!data.measurement?.includes("-")) {
      return { size: null, unit: "UK" as ApparelSizeUnit };
    }
    const [size, unit] = data.measurement.split("-");
    const validUnit =
      unit && APPAREL_SIZE_UNITS.includes(unit as ApparelSizeUnit)
        ? (unit as ApparelSizeUnit)
        : "UK";
    return { size: size || null, unit: validUnit };
  }, [data.measurement]);

  const sizes = useMemo(
    () => APPAREL_SIZE_OPTIONS[parsed.unit] ?? APPAREL_SIZE_OPTIONS.UK,
    [parsed.unit],
  );

  const commit = (size: string, unit: ApparelSizeUnit) => {
    setField("measurement", `${size}-${unit}`);
    setOpen(false);
  };

  return (
    <div className="relative w-full">
      <Paragraph1 className="mb-2 text-xs  ">Size</Paragraph1>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm  transition-all duration-200 hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
      >
        <span className={parsed.size ? "text-gray-900 " : "text-gray-500"}>
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
            {APPAREL_SIZE_UNITS.map((u) => {
              const targetSizes =
                APPAREL_SIZE_OPTIONS[u] ?? APPAREL_SIZE_OPTIONS.UK;
              return (
                <button
                  key={u}
                  onClick={() => {
                    // If no size selected, auto-select the first size of this unit
                    const sizeToUse = parsed.size || targetSizes[0];
                    setField("measurement", `${sizeToUse}-${u}`);
                  }}
                  className={`whitespace-nowrap rounded px-2 py-2 text-xs font-semibold transition-all duration-200 sm:flex-1 sm:rounded-none ${
                    parsed.unit === u
                      ? "border-b-2 border-blue-500 bg-white text-blue-600"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {u}
                </button>
              );
            })}
          </div>

          {/* Size grid - scrollable */}
          <div className="max-h-48 overflow-y-auto">
            <div className="grid grid-cols-3 gap-2 p-3 sm:grid-cols-4">
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
        </div>
      )}
    </div>
  );
};
