import { INHOUSE_USER_ID } from "@/lib/inhouseManager";

/**
 * Who sees closet-aware inventory (picker, "No closet", create/edit closet from inventory).
 *
 * Set `NEXT_PUBLIC_CLOSET_INVENTORY_USER_IDS` to a comma-separated list of user UUIDs.
 * If unset or empty, defaults to the single ID from `inhouseManager` (`INHOUSE_USER_ID`).
 *
 * Note: `NEXT_PUBLIC_CLOSET_INVENTORY_ALL_LISTERS` was removed because Turbopack inlines
 * `NEXT_PUBLIC_*` env vars at compile time and caches them in-memory, making them unreliable
 * for toggling in dev mode. Use the allowlist approach instead.
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
  const allowlist = parseClosetInventoryAllowlist(
    process.env.NEXT_PUBLIC_CLOSET_INVENTORY_USER_IDS,
    "",
  );
  return allowlist.includes(userId);
}
