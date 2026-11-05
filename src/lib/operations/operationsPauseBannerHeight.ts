/** Measured height of the fixed holiday pause strip (see OperationsPauseBanner). */
export const OPERATIONS_PAUSE_BANNER_HEIGHT_VAR =
  "--operations-pause-banner-height";

export function clearOperationsPauseBannerHeight(): void {
  if (typeof document === "undefined") return;
  document.documentElement.style.setProperty(
    OPERATIONS_PAUSE_BANNER_HEIGHT_VAR,
    "0px",
  );
}

export function syncOperationsPauseBannerHeight(node: HTMLElement | null): void {
  if (typeof document === "undefined") return;
  if (!node) {
    clearOperationsPauseBannerHeight();
    return;
  }
  document.documentElement.style.setProperty(
    OPERATIONS_PAUSE_BANNER_HEIGHT_VAR,
    `${Math.ceil(node.getBoundingClientRect().height)}px`,
  );
}
