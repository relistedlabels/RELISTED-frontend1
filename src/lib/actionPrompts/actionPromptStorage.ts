const SESSION_DISMISSED_KEY = "relisted-action-prompt-session-dismissed";
const ITEM_KEY_PREFIX = "relisted-action-prompt-";

function promptItemKey(kind: string, id: string): string {
  return `${ITEM_KEY_PREFIX}${kind}-${id}`;
}

/** Clears prompt suppression so incomplete actions can surface again after login. */
export function clearActionPromptSessionStorage(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SESSION_DISMISSED_KEY);
  const keysToRemove: string[] = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key?.startsWith(ITEM_KEY_PREFIX)) keysToRemove.push(key);
  }
  for (const key of keysToRemove) sessionStorage.removeItem(key);
}

export function isActionPromptSessionDismissed(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(SESSION_DISMISSED_KEY) === "1";
}

export function dismissActionPromptSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_DISMISSED_KEY, "1");
}

export function isActionPromptItemDismissed(kind: string, id: string): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(promptItemKey(kind, id)) === "1";
}

export function dismissActionPromptItem(kind: string, id: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(promptItemKey(kind, id), "1");
}

export function isActionPromptSuppressedPath(pathname: string): boolean {
  const prefixes = [
    "/auth",
    "/onboarding",
    "/shop/cart/checkout",
    "/shop/cart",
  ];
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
