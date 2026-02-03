"use client";

import React, { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import { ToolInfo } from "@/common/ui/ToolInfo";
import { useProductDraftStore } from "@/store/useProductDraftStore";
import { useCreateTag } from "@/lib/mutations";
import { useTags,  } from "@/lib/queries/tag/useTags";


// Tags that show in the box (first 12 when no search)
const BOX_TAG_NAMES = [
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
  const { data, setField } = useProductDraftStore();

  const selectedTagId: string | undefined = data.tagId;
  const { data: tags = [] } = useTags();
  const { mutate: createTag } = useCreateTag();

  const sortedTags = useMemo(() => {
    const boxOrderMap = new Map(
      BOX_TAG_NAMES.map((n, i) => [n.toLowerCase(), i]),
    );
    const boxSet = new Set(BOX_TAG_NAMES.map((n) => n.toLowerCase()));
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

  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-1">
        <Paragraph1 className="text-xs font-bold text-black">Tag</Paragraph1>
        <ToolInfo content="Select a tag to categorize your item or add a new tag if one doesn't exist." />
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search tag..."
        className="mb-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
      />

      <div className="flex flex-wrap gap-2">
        {visibleTags.map((tag) => {
          const active = selectedTagId === tag.id;
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => setField("tagId", tag.id)}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                active
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
              onClick={() => {
                const newId = `new-${query}`;
                createTag({ name: query });
                setField("tagId", newId);
                setQuery("");
              }}
              className="flex items-center gap-1 rounded-md border border-dashed border-gray-400 px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-black"
            >
              <Plus className="h-3 w-3" />
              Add “{query}”
            </button>
          )}
      </div>
    </div>
  );
};
