import type { AdminComboBoxOption } from "@/app/admin/components/AdminComboBox";

export type DispatchFilter = "all" | "manual" | "automated";

/** Shared label for manual vs carrier-booked dispatch filtering. */
export const DISPATCH_FILTER_LABEL = "Dispatch";

export const DISPATCH_FILTER_OPTIONS: AdminComboBoxOption[] = [
  { value: "all", label: "All dispatch types" },
  { value: "manual", label: "Relisted dispatch" },
  { value: "automated", label: "Carrier booking" },
];

export const ADMIN_FILTER_INPUT_CLASS =
  "w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900";

export const ADMIN_FILTER_DATE_CLASS = ADMIN_FILTER_INPUT_CLASS;

export const ADMIN_FILTER_BAR_CLASS =
  "grid grid-cols-2 gap-3 lg:flex lg:flex-wrap lg:items-end";

export const ADMIN_FILTER_FIELD_WIDTH = {
  type: "lg:w-40",
  dispatch: "lg:w-44",
  status: "lg:w-40",
  search: "col-span-2 lg:min-w-[14rem] lg:flex-1",
} as const;

export const ADMIN_FILTER_SECTION_CLASS = "border-gray-200 border-b px-4 py-4 sm:px-5";
