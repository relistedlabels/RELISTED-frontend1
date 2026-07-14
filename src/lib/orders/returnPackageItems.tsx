"use client";

import { Paragraph1 } from "@/common/ui/Text";
import { cloudinaryOptimizedImageUrl } from "@/lib/media/cloudinaryOptimizedImageUrl";

export type ReturnPackageItem = { name: string; imageUrl?: string | null };

/** Thumbnail row so multi-lister returns are tied to the right product(s). */
export function ReturnPackageItems({
  items,
}: {
  items: ReturnPackageItem[];
}) {
  if (!items.length) return null;
  return (
    <div className="mt-2 flex flex-col gap-2">
      {items.map((item) => (
        <div
          key={`${item.name}-${item.imageUrl ?? ""}`}
          className="flex min-w-0 items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-2"
        >
          {item.imageUrl ? (
            <img
              src={cloudinaryOptimizedImageUrl(item.imageUrl, {
                preset: "thumb",
              })}
              alt={item.name}
              className="h-14 w-14 shrink-0 rounded-md object-cover"
            />
          ) : (
            <div className="h-14 w-14 shrink-0 rounded-md bg-gray-200" />
          )}
          <Paragraph1 className="truncate text-sm font-medium text-gray-900">
            {item.name}
          </Paragraph1>
        </div>
      ))}
    </div>
  );
}

export function itemsForProgressGroup(
  group: { itemNames: string[] },
  orderItems: Array<{ name?: string; imageUrl?: string | null }> | undefined,
): ReturnPackageItem[] {
  return group.itemNames.map((name) => {
    const hit = orderItems?.find((i) => i.name === name);
    return { name, imageUrl: hit?.imageUrl ?? null };
  });
}
