"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import { useProductDraftStore } from "@/store/useProductDraftStore";

const CONDITIONS = [
  "Brand New",
  "Like New",
  "Gently Used",
  "Used",
  "Heavily Used",
];

export const ConditionSelector: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const { data, setField } = useProductDraftStore();

  // Sync selected state with store
  useEffect(() => {
    if (data.condition) setSelected(data.condition);
  }, [data.condition]);

  const handleSelect = (condition: string) => {
    setSelected(condition);
    setOpen(false);
    setField("condition", condition); // update Zustand store
  };

  return (
    <div className="relative w-full">
      <Paragraph1 className="mb-1 text-xs font-medium text-gray-700">
        Condition
      </Paragraph1>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-black"
      >
        <span className={selected ? "text-black" : "text-gray-400"}>
          {selected ?? "Select condition"}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </button>

      {open && (
        <div className="absolute z-40 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-sm">
          {CONDITIONS.map((condition) => (
            <button
              key={condition}
              onClick={() => handleSelect(condition)}
              className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-gray-50"
            >
              <span>{condition}</span>
              {selected === condition && <Check className="h-4 w-4 text-black" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
