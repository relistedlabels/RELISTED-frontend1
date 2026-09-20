/** Slide-in panel backdrop (orders, disputes, wallet). */
export const slidePanelBackdrop =
  "fixed inset-0 z-[99] bg-black/70 backdrop-blur-sm";

/** Right-side slide-in sheet. */
export const slidePanelSheet =
  "fixed inset-y-0 right-0 flex h-[100dvh] w-full flex-col overflow-y-auto hide-scrollbar bg-white px-4 shadow-2xl sm:w-[28.5rem]";

/** Full-height sheet with pinned header/footer and scrollable body. */
export const slidePanelSheetPinned =
  "fixed inset-y-0 right-0 flex h-[100dvh] w-full flex-col overflow-hidden hide-scrollbar bg-white px-4 shadow-2xl sm:w-[28.5rem]";

/** Scrollable panel body (use inside sheets with pinned footers). */
export const slidePanelBody =
  "min-h-0 flex-1 overflow-y-auto hide-scrollbar";

/** Pinned action row for filter-style panels. */
export const slidePanelActionsFooter =
  "flex shrink-0 gap-3 border-t border-gray-100 bg-white px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:px-5";

/** Sticky panel header row. */
export const slidePanelHeader =
  "sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-gray-100 bg-white pb-4 pt-6";

/** Panel title — sentence case, no wide tracking. */
export const slidePanelTitle = "font-bold text-gray-900 text-sm";

/** Sticky panel footer action row. */
export const slidePanelFooter =
  "sticky bottom-0 z-20 shrink-0 border-t border-gray-100 bg-white pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]";

/** Centered dialog backdrop. */
export const dialogBackdrop =
  "fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm";

/** Bottom sheet backdrop (flush to screen edge; no outer padding). */
export const bottomSheetBackdrop =
  "fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm";

/** Bottom sheet panel shell with safe-area padding. */
export const bottomSheetPanel =
  "relative w-full rounded-t-3xl bg-white pb-[calc(1.5rem+env(safe-area-inset-bottom))]";

/** Centered dialog card. */
export const dialogCard =
  "w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl";

/** Standard dashboard card shell. */
export const dashboardCard =
  "rounded-xl border border-gray-200 bg-white";

/** Segmented control container (tabs). */
export const segmentContainer =
  "inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1";
