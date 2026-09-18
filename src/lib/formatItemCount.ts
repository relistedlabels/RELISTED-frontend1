export function formatItemCount(count: number): string {
  const n = Math.max(0, Math.trunc(Number(count) || 0));
  return n === 1 ? "1 item" : `${n} items`;
}
