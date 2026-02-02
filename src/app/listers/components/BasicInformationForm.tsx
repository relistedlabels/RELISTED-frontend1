"use client";

import React, { useMemo } from "react";
import { Paragraph3, Paragraph1 } from "@/common/ui/Text";
import { ToolInfo } from "@/common/ui/ToolInfo";
import { BrandSelector } from "./BrandSelector";
import { SizeSelector } from "./SizeSelector";
import { ColorSelector } from "./ColorSelector";
import { ConditionSelector } from "./ConditionSelector";
import { SubTextInput } from "./SubTextInput";
import { QuantityInput } from "./QuantityInput";
import { useProductDraftStore } from "@/store/useProductDraftStore";
import { PricingFields } from "./PricingFields";
import { CategorySelector } from "./CategorySelector";

export const BasicInformationForm: React.FC = () => {
  const { data, setField } = useProductDraftStore();

  const dailyRentalPrice = useMemo(
    () => Math.round((data.originalValue || 0) * 0.1),
    [data.originalValue],
  );

  return (
    <div className="w-full rounded-xl border border-gray-200 p-4">
      <div className="mb-4">
        <Paragraph3 className="text-sm font-semibold text-black">
          Basic Information
        </Paragraph3>
        <Paragraph1 className="text-xs text-gray-500">
          Upload at least 5 high quality images and videos of your item
        </Paragraph1>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Paragraph1 className="text-xs font-medium text-gray-700">
              Item Name
            </Paragraph1>
            <ToolInfo content="Enter a clear, descriptive name for your item. Be specific about brand and key features." />
          </div>
          <input
            type="text"
            placeholder="eg. Fendi Arco Boots"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
            value={data.name}
            onChange={(e) => setField("name", e.target.value)}
          />
        </div>

        <SubTextInput />

        <BrandSelector />

        <PricingFields />

        <div className="grid grid-cols-2 gap-4">
          <SizeSelector />
          <ColorSelector />
        </div>

        <ConditionSelector />
        <div className="grid grid-cols-2 gap-4  ">
          <QuantityInput />
          <CategorySelector />
        </div>
      </div>
    </div>
  );
};
