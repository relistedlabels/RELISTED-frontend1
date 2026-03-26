"use client";

import React, { useMemo } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { ToolInfo } from "@/common/ui/ToolInfo";
import { useProductDraftStore } from "@/store/useProductDraftStore";
import { useTags } from "@/lib/queries/tag/useTags";
import { CategorySelector } from "./CategorySelector";

export const TagSelector: React.FC = () => {
  const { data, setField } = useProductDraftStore();

  const selectedTagIds = data.tagIds || [];
  // Fetch all tags from backend
  const { data: tags = [] } = useTags();

  const visibleTags = useMemo(() => {
    // Display all tags
    return tags;
  }, [tags]);

  const toggleTag = (tagId: string) => {
    setField(
      "tagIds",
      selectedTagIds.includes(tagId)
        ? selectedTagIds.filter((id) => id !== tagId)
        : [...selectedTagIds, tagId],
    );
  };

  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <CategorySelector />
      <div className="flex items-center gap-2 mt-4 mb-3">
        <Paragraph1 className="text-xs font-bol">Sub Categories</Paragraph1>
        <ToolInfo content="Tell renters where they can happily wear this item — pick occasions, events, and moments perfect for this piece. For example: 'Date night', 'Wedding guest', 'Brunch outfit', 'Vacation', 'Party', or 'Night out'." />
      </div>

      <div className="flex flex-wrap gap-2">
        {visibleTags.map((tag) => {
          const isSelected = selectedTagIds.includes(tag.id);
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                isSelected
                  ? "border-black bg-black text-white"
                  : "border-gray-200 text-gray-700 hover:border-gray-400"
              }`}
            >
              {tag.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
