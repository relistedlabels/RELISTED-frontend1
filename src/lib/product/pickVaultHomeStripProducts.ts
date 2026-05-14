import type { UserProduct } from "@/lib/api/product";

function shuffleInPlace<T>(items: T[]): void {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = items[i]!;
    items[i] = items[j]!;
    items[j] = t;
  }
}

/**
 * Picks up to `limit` products for the home Vault strip by round-robin across
 * closets (after shuffling within each closet and shuffling closet order) so
 * one wardrobe does not fill the whole row when the API default is newest-first.
 */
export function pickVaultHomeStripProducts(
  products: UserProduct[],
  limit: number,
): UserProduct[] {
  if (limit <= 0 || products.length === 0) return [];

  const byCloset = new Map<string, UserProduct[]>();
  for (const p of products) {
    const cid = p.closet?.id ?? p.closetId;
    if (!cid) continue;
    const existing = byCloset.get(cid);
    if (existing) existing.push(p);
    else byCloset.set(cid, [p]);
  }

  const buckets = [...byCloset.values()];
  if (buckets.length === 0) {
    return products.slice(0, limit);
  }

  for (const b of buckets) shuffleInPlace(b);
  shuffleInPlace(buckets);

  const result: UserProduct[] = [];
  const nextIdx = new Array(buckets.length).fill(0);

  while (result.length < limit) {
    let progressed = false;
    for (let i = 0; i < buckets.length; i++) {
      if (result.length >= limit) break;
      const idx = nextIdx[i]!;
      if (idx < buckets[i]!.length) {
        result.push(buckets[i]![idx]!);
        nextIdx[i] = idx + 1;
        progressed = true;
      }
    }
    if (!progressed) break;
  }

  return result;
}
