import type { Attachment } from "@/store/useProductDraftStore";

/** Matches `ItemImageUploader` slot ids: gallery and API order follow this sequence. */
export const LISTING_ATTACHMENT_SLOT_ORDER = [
  "main",
  "photo1",
  "photo2",
  "photo3",
  "video",
] as const;

const slotIndex = new Map<string, number>(
  LISTING_ATTACHMENT_SLOT_ORDER.map((id, i) => [id, i]),
);

/**
 * Returns attachments ordered by listing slot (main first, then photo1–3, then video).
 * Unknown `slotId` values stay after known slots; items without `slotId` stay at the end.
 */
export function orderListingAttachments(
  attachments: Attachment[],
): Attachment[] {
  const withoutSlot = attachments.filter((a) => !a.slotId);
  const bySlot = new Map<string, Attachment>();
  for (const att of attachments) {
    if (att.slotId) bySlot.set(att.slotId, att);
  }
  const ordered = LISTING_ATTACHMENT_SLOT_ORDER.map((sid) =>
    bySlot.get(sid),
  ).filter((a): a is Attachment => Boolean(a));
  const usedIds = new Set(ordered.map((a) => a.id));
  const leftoverSlotted = attachments.filter(
    (a) => a.slotId && !usedIds.has(a.id),
  );
  leftoverSlotted.sort((a, b) => {
    const ia = a.slotId ? slotIndex.get(a.slotId) : undefined;
    const ib = b.slotId ? slotIndex.get(b.slotId) : undefined;
    return (ia ?? 99) - (ib ?? 99);
  });
  return [...ordered, ...leftoverSlotted, ...withoutSlot];
}

export function listingAttachmentsSameOrder(
  a: Attachment[],
  b: Attachment[],
): boolean {
  if (a.length !== b.length) return false;
  return a.every(
    (att, i) => att.id === b[i]?.id && att.slotId === b[i]?.slotId,
  );
}

/** Image upload ids for product create/update, in canonical slot order. */
export function orderedImageAttachmentIds(attachments: Attachment[]): string[] {
  return orderListingAttachments(attachments)
    .filter(
      (att) =>
        att.type === "image" ||
        (!att.type && att.slotId && att.slotId !== "video"),
    )
    .map((att) => att.id);
}
