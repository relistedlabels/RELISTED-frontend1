"use client";

import React, { useState, useMemo } from "react";
import { Plus, X } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import { ToolInfo } from "@/common/ui/ToolInfo";
import { useProductDraftStore } from "@/store/useProductDraftStore";
import { useTags, useCreateTag } from "@/lib/queries/tag/useTags";

// Preferred tags from backend - used for initial display ordering
// When backend provides tags, these names will be prioritized and shown first
const PREFERRED_TAG_NAMES = [
  "New season",
  "Date night",
  "Brunch outfit",
  "Night out",
  "Wedding guest",
  "Mini dress",
  "Midi dress",
  "Classy",
  "Vacation",
  "Party",
  "Luxury",
  "Formal wear",
];

export const TagSelector: React.FC = () => {
  const [query, setQuery] = useState("");
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const { data, setField } = useProductDraftStore();

  const selectedTagIds = data.tagIds || [];
  // Fetch all tags from backend
  const { data: tags = [] } = useTags();
  const createMutation = useCreateTag();

  const sortedTags = useMemo(() => {
    const boxOrderMap = new Map(
      PREFERRED_TAG_NAMES.map((n, i) => [n.toLowerCase(), i]),
    );
    const boxSet = new Set(PREFERRED_TAG_NAMES.map((n) => n.toLowerCase()));
    const inBox: typeof tags = [];
    const rest: typeof tags = [];
    for (const t of tags) {
      if (boxSet.has(t.name.toLowerCase())) inBox.push(t);
      else rest.push(t);
    }
    inBox.sort(
      (a, b) =>
        (boxOrderMap.get(a.name.toLowerCase()) ?? 999) -
          (boxOrderMap.get(b.name.toLowerCase()) ?? 999) ||
        a.name.localeCompare(b.name),
    );
    return [...inBox, ...rest];
  }, [tags]);

  const visibleTags = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sortedTags.slice(0, 12);
    return sortedTags.filter((t) => t.name.toLowerCase().includes(q));
  }, [sortedTags, query]);

  const toggleTag = (tagId: string) => {
    setField(
      "tagIds",
      selectedTagIds.includes(tagId)
        ? selectedTagIds.filter((id) => id !== tagId)
        : [...selectedTagIds, tagId],
    );
  };

  const handleAddTag = async () => {
    if (!query.trim()) return;
    setIsCreatingTag(true);
    try {
      const result = await createMutation.mutateAsync({ name: query.trim() });
      setField("tagIds", [...selectedTagIds, result.id]);
      setQuery("");
    } finally {
      setIsCreatingTag(false);
    }
  };

  const removeTag = (tagId: string) => {
    setField(
      "tagIds",
      selectedTagIds.filter((id) => id !== tagId),
    );
  };

  // Get selected tag objects for display
  const selectedTags = tags.filter((t) => selectedTagIds.includes(t.id));

  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Paragraph1 className="text-xs font-bold text-black">
          Search Tags
        </Paragraph1>
        <ToolInfo content="Select multiple tags to categorize your item. You can add new tags if one doesn't exist." />
      </div>

      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => removeTag(tag.id)}
              className="flex items-center gap-1 rounded-md border border-black bg-black px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-900"
            >
              {tag.name}
              <X className="h-3 w-3" />
            </button>
          ))}
        </div>
      )}

      {/* Search Input */}
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search or add tags..."
        className="mb-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
      />

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

        {query &&
          !tags.some((t) => t.name.toLowerCase() === query.toLowerCase()) && (
            <button
              type="button"
              onClick={handleAddTag}
              disabled={isCreatingTag}
              className="flex items-center gap-1 rounded-md border border-dashed border-gray-400 px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-black disabled:opacity-50"
            >
              <Plus className="h-3 w-3" />
              Add “{query}”
            </button>
          )}
      </div>
    </div>
  );
};
