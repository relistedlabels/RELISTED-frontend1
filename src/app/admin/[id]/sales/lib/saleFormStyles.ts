/** Shared admin sale form field widths (desktop-friendly, still full width on mobile). */

const fieldFocus =
  "focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400";

export const saleFieldWrapClass = "w-full max-w-md";
export const saleFieldWideWrapClass = "w-full max-w-xl";
export const saleDateTimeWrapClass = "w-full max-w-md";

export const saleInputClass = `mt-1.5 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white ${fieldFocus}`;

export const saleInputMonoClass = `${saleInputClass} font-mono`;

export const saleTextareaClass = `mt-1.5 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white resize-y ${fieldFocus}`;

export const saleTextareaMonoClass = `${saleTextareaClass} font-mono`;

export const saleReadonlyBoxClass =
  "mt-1.5 w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800";
