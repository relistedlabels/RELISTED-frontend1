import { INHOUSE_USER_ID } from "@/lib/inhouseManager";

/**
 * Local / QA: allow every signed-in lister to use closet inventory UI (picker, create closet, etc.).
 * Add to `.env.local`: `NEXT_PUBLIC_CLOSET_INVENTORY_ALL_LISTERS=true`
 * Omit or set `false` in production so only allowlisted IDs apply.
 */
function isClosetInventoryOpenForAllListers(): boolean {
  const v = process.env.NEXT_PUBLIC_CLOSET_INVENTORY_ALL_LISTERS?.trim();
  return v === "1" || v?.toLowerCase() === "true";
}

/**
 * Who sees closet-aware inventory (picker, “No closet”, create/edit closet from inventory).
 *
 * Set `NEXT_PUBLIC_CLOSET_INVENTORY_USER_IDS` to a comma-separated list of user UUIDs.
 * If unset or empty, defaults to the single ID from `inhouseManager` (`INHOUSE_USER_ID`).
 */
function allowlistedClosetInventoryUserIds(): string[] {
  const raw = process.env.NEXT_PUBLIC_CLOSET_INVENTORY_USER_IDS;
  if (raw !== undefined && raw.trim() !== "") {
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [INHOUSE_USER_ID];
}

export function isClosetInventoryLister(userId: string | undefined): boolean {
  if (!userId) return false;
  if (isClosetInventoryOpenForAllListers()) return true;
  return allowlistedClosetInventoryUserIds().includes(userId);
}
