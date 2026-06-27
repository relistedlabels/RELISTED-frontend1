"use client";

import { Paragraph1 } from "@/common/ui/Text";

type Props = {
  minPrice?: number;
  maxPrice?: number;
  onChange: (next: { minPrice?: number; maxPrice?: number }) => void;
};

function parseOptionalPrice(raw: string): number | undefined {
  if (!raw.trim()) return undefined;
  const num = Number(raw);
  if (!Number.isFinite(num) || num < 0) return undefined;
  return Math.round(num);
}

export default function PriceFilterInputs({
  minPrice,
  maxPrice,
  onChange,
}: Props) {
  return (
    <section>
      <Paragraph1 className="uppercase font-bold text-xs mb-3 text-gray-800">
        Price (NGN)
      </Paragraph1>
      <Paragraph1 className="text-gray-500 text-xs mb-3">
        Optional. Filters daily rental and resale prices.
      </Paragraph1>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="filter-min-price"
            className="block text-xs text-gray-600 mb-1"
          >
            Min
          </label>
          <input
            id="filter-min-price"
            type="number"
            min={0}
            step={1}
            placeholder="e.g. 5000"
            value={minPrice ?? ""}
            onChange={(e) =>
              onChange({
                minPrice: parseOptionalPrice(e.target.value),
                maxPrice,
              })
            }
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-gray-400"
          />
        </div>
        <div>
          <label
            htmlFor="filter-max-price"
            className="block text-xs text-gray-600 mb-1"
          >
            Max
          </label>
          <input
            id="filter-max-price"
            type="number"
            min={0}
            step={1}
            placeholder="e.g. 500000"
            value={maxPrice ?? ""}
            onChange={(e) =>
              onChange({
                minPrice,
                maxPrice: parseOptionalPrice(e.target.value),
              })
            }
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-gray-400"
          />
        </div>
      </div>
    </section>
  );
}
