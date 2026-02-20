"use client";

import React from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { ToolInfo } from "@/common/ui/ToolInfo";
import { useProductDraftStore } from "@/store/useProductDraftStore";

export const ItemDescription: React.FC = () => {
  const { data, setField } = useProductDraftStore();


  return (
    <div className="w-full rounded-xl border border-gray-200 p-4 space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Paragraph1 className="text-xs font-medium text-gray-700">
            Item condition
          </Paragraph1>
          <ToolInfo content="Write a detailed description of your item including its condition, features, and any notable details." />
        </div>
        <textarea
          value={data.description}
          onChange={(e) => setField("description", e.target.value)}
          placeholder="Describe your item condition..."
          className="w-full h-24 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black resize-none"
        />
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <Paragraph1 className="text-xs font-medium text-gray-700">
            Care Instructions
          </Paragraph1>
          <ToolInfo content="Provide general care instructions to help renters maintain the item properly." />
        </div>
        <textarea
          value={data.careInstruction}
          onChange={(e) => setField("careInstruction", e.target.value)}
          placeholder="How to care for this item..."
          className="w-full h-24 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black resize-none"
        />
      </div>


      <div>
        <div className="flex items-center gap-2 mb-2">
          <Paragraph1 className="text-xs font-medium text-gray-700">
            Styling Tips
          </Paragraph1>
          <ToolInfo content="Share ideas on how to style or use this item to inspire potential renters." />
        </div>
        <textarea
          value={data.stylingTip}
          onChange={(e) => setField("stylingTip", e.target.value)}
          placeholder="How to style this item (eg: )..."
          className="w-full h-24 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black resize-none"
        />
      </div>
    </div>
  );
};
// 3DD6DFAF
