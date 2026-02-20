"use client";

import React from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { useProductDraftStore } from "@/store/useProductDraftStore";

export const MaterialSelector: React.FC = () => {
  const { data, setField } = useProductDraftStore();

  return (
    <div className="w-full">
      <Paragraph1 className="mb-1 text-xs font-medium text-gray-700">
        Material Type
      </Paragraph1>

      <input
        type="text"
        placeholder="e.g., 60% Cotton, 40% Polyester or Pure Silk or Leather blend"
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
        value={data.material}
        onChange={(e) => setField("material", e.target.value)}
      />
    </div>
  );
};
