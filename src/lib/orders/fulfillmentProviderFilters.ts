export type FulfillmentProviderFilter =
  | "all"
  | "manual"
  | "topship"
  | "shipbubble"
  | "chowdeck_relay";

export const FULFILLMENT_PROVIDER_FILTER_OPTIONS: Array<{
  value: FulfillmentProviderFilter;
  label: string;
}> = [
  { value: "all", label: "All fulfillment" },
  { value: "manual", label: "Relisted dispatch" },
  { value: "topship", label: "Topship" },
  { value: "shipbubble", label: "Shipbubble" },
  { value: "chowdeck_relay", label: "Chowdeck Relay" },
];

export function fulfillmentProviderToApiParam(
  filter: FulfillmentProviderFilter,
): string | undefined {
  if (filter === "all") return undefined;
  return filter;
}
