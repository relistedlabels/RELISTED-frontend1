/** Primary action — matches checkout and account forms. */
export const buttonPrimary =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50";

/** Secondary / outline action. */
export const buttonSecondary =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50";

/** Segmented tab (selected). */
export const segmentTabActive =
  "rounded-lg bg-black px-6 py-2 text-sm font-semibold text-white transition";

/** Segmented tab (default). */
export const segmentTabIdle =
  "rounded-lg px-6 py-2 text-sm font-semibold text-gray-700 transition hover:bg-white";

/** Primary action, full width. */
export const buttonPrimaryFull = `${buttonPrimary} w-full`;

/** Destructive confirmation (e.g. log out). */
export const buttonDestructive =
  "inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50";
