import type { FullProfile, ProfileAddress } from "@/types/profile";

type AddressLike =
  | Pick<ProfileAddress, "street" | "city" | "state">
  | null
  | undefined;

export function hasCompleteDeliveryAddress(
  address: AddressLike,
): boolean {
  if (!address) return false;
  const street = address.street?.trim();
  const city = address.city?.trim();
  const state = address.state?.trim();
  return Boolean(street && city && state);
}

export function profileHasDeliveryAddress(
  profile: FullProfile | null | undefined,
): boolean {
  return hasCompleteDeliveryAddress(profile?.address);
}

export function formatDeliveryAddressLine(
  address: AddressLike,
): string | null {
  if (!hasCompleteDeliveryAddress(address)) return null;
  const parts = [
    address!.street?.trim(),
    address!.city?.trim(),
    address!.state?.trim(),
  ].filter(Boolean);
  return parts.join(", ");
}
