"use client";

import React from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { ToolInfo } from "@/common/ui/ToolInfo";
import { useProductDraftStore } from "@/store/useProductDraftStore";

export const QuantityInput: React.FC = () => {
  const { data, setField } = useProductDraftStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    if (value >= 0) {
      setField("quantity", value);
    }
  };

  const handleIncrement = () => {
    setField("quantity", data.quantity + 1);
  };

  const handleDecrement = () => {
    if (data.quantity > 0) {
      setField("quantity", data.quantity - 1);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-2">
        <Paragraph1 className="text-xs font-medium text-gray-700">
          Quantity Available
        </Paragraph1>
        <ToolInfo content="How many copies of this item do you have available for rent?" />
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={data.quantity === 0}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          −
        </button>
        <input
          type="number"
          value={data.quantity}
          onChange={handleChange}
          min="0"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-center text-sm outline-none transition-colors focus:border-black focus:ring-1 focus:ring-black"
        />
        <button
          type="button"
          onClick={handleIncrement}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold hover:bg-gray-50"
        >
          +
        </button>
      </div>
      <p className="mt-1 text-xs text-gray-500">
        Total items available for rent
      </p>
    </div>
  );
};
