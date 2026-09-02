import { INHOUSE_USER_ID } from "@/lib/inhouseManager";

/**
 * Local / QA: allow every signed-in lister to use closet inventory UI (picker, create closet, etc.).
 * Add to `.env.local`: `NEXT_PUBLIC_CLOSET_INVENTORY_ALL_LISTERS=true`
 * Omit or set `false` in production so only allowlisted IDs apply.
 */
export function isClosetInventoryOpenForAllListersFlag(
  envValue: string | undefined,
): boolean {
  const v = envValue?.trim();
  return v === "1" || v?.toLowerCase() === "true";
}

/**
 * Who sees closet-aware inventory (picker, “No closet”, create/edit closet from inventory).
 *
 * Set `NEXT_PUBLIC_CLOSET_INVENTORY_USER_IDS` to a comma-separated list of user UUIDs.
 * If unset or empty, defaults to the single ID from `inhouseManager` (`INHOUSE_USER_ID`).
 */
export function parseClosetInventoryAllowlist(
  envUserIds: string | undefined,
  fallbackUserId: string,
): string[] {
  if (envUserIds !== undefined && envUserIds.trim() !== "") {
    return envUserIds
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [fallbackUserId];
}

export function isClosetInventoryLister(userId: string | undefined): boolean {
  if (!userId) return false;
  if (
    isClosetInventoryOpenForAllListersFlag(
      process.env.NEXT_PUBLIC_CLOSET_INVENTORY_ALL_LISTERS,
    )
  ) {
    return true;
  }
  return parseClosetInventoryAllowlist(
    process.env.NEXT_PUBLIC_CLOSET_INVENTORY_USER_IDS,
    INHOUSE_USER_ID,
  ).includes(userId);
}
