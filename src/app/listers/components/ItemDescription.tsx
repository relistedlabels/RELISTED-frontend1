"use client";

import React from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { ToolInfo } from "@/common/ui/ToolInfo";
import { useProductDraftStore } from "@/store/useProductDraftStore";

export const ItemDescription: React.FC = () => {
  const { data, setField } = useProductDraftStore();

  const handleCareStepsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Ensure it's always a string
    setField("careSteps", e.target.value);
  };

  return (
    <div className="w-full rounded-xl border border-gray-200 p-4 space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Paragraph1 className="text-xs font-medium text-gray-700">
            Description
          </Paragraph1>
          <ToolInfo content="Tell the story of your item. What makes it special? Is it a rare piece, vintage find, limited edition, or mini style? Share what makes renters want to wear it." />
        </div>
        <textarea
          value={data.description}
          onChange={(e) => setField("description", e.target.value)}
          placeholder="E.g., Rare vintage Hermès mini bag, limited edition designer collaboration, summer must-have mini skirt, timeless investment piece from the 90s..."
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
          placeholder="E.g., Do not dry clean or hand wash with cold water, avoid direct sunlight, iron on low heat, store in cool dry place..."
          className="w-full h-24 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black resize-none"
        />
      </div>

      {/* <div>
        <div className="flex items-center gap-2 mb-2">
          <Paragraph1 className="text-xs font-medium text-gray-700">
            Care Steps
          </Paragraph1>
          <ToolInfo content="List step-by-step instructions for caring for or cleaning this item." />
        </div>
        <textarea
          value={typeof data.careSteps === "string" ? data.careSteps : ""}
          onChange={handleCareStepsChange}
          placeholder="Step-by-step care instructions..."
          className="w-full h-24 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black resize-none"
        />
      </div> */}

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
          placeholder="E.g., Perfect for formal events, pairs well with gold earrings and bracelets, great for a sophisticated date night look..."
          className="w-full h-24 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black resize-none"
        />
      </div>
    </div>
  );
};
// 3DD6DFAF
