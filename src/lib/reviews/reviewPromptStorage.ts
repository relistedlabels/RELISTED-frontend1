const skippedKey = (orderId: string) => `relisted-review-skipped-${orderId}`;

export function isReviewPromptSkipped(orderId: string): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(skippedKey(orderId)) === "1";
}

export function skipReviewPrompt(orderId: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(skippedKey(orderId), "1");
}

export function clearReviewPromptSkip(orderId: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(skippedKey(orderId));
}
