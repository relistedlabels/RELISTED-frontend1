"use client";

import React from "react";
import { Paragraph3, Paragraph1, ParagraphAny } from "@/common/ui/Text";
import { ToolInfo } from "@/common/ui/ToolInfo";
import { useProductDraftStore } from "@/store/useProductDraftStore";

export const SaleTypeSelector: React.FC = () => {
  const { data, setField } = useProductDraftStore();

  const saleOptions = [
    {
      id: "resale",
      title: "Resale",
      subtitle: "Sell permanently",
      description: "List this item for sale only",
    },
    {
      id: "rent",
      title: "Rent",
      subtitle: "Rent only",
      description: "Allow customers to rent this item",
    },
    {
      id: "rent-resale",
      title: "Rent & Resale",
      subtitle: "Rent or sell",
      description: "Allow customers to rent or purchase this item",
    },
  ];

  return (
    <div className="w-full rounded-xl border border-gray-200 p-4">
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <Paragraph3 className="text-sm font-semibold text-black">
            Sale Type
          </Paragraph3>
          <ToolInfo content="Choose how you want to list this item. Resale = permanent sale only. Rent = rental only. Rent & Resale = allow customers to either rent or buy." />
        </div>
        <Paragraph1 className="text-xs text-gray-500 mt-1">
          How do you want to list this item?
        </Paragraph1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {saleOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() =>
              setField(
                "saleType",
                option.id as "resale" | "rent" | "rent-resale",
              )
            }
            className={`rounded-lg border-2 p-4 text-left transition ${
              data.saleType === option.id
                ? "border-black bg-black text-white"
                : "border-gray-200 bg-white text-gray-900 hover:border-gray-300"
            }`}
          >
            <ParagraphAny className="font-semibold text-center text-[15px]">{option.title}</ParagraphAny>
            <Paragraph1
              className={`text-xs mt-1 text-center ${
                data.saleType === option.id ? "text-gray-200" : "text-gray-500"
              }`}
            >
              {option.subtitle}
            </Paragraph1>
          </button>
        ))}
      </div>
    </div>
  );
};
