import { isValidPhoneNumber } from "@/lib/phone";

type PhoneSource = {
  phone?: string | null;
  phoneNumber?: string | null;
  emergencyContact?: {
    phone?: string | null;
    phoneNumber?: string | null;
  } | null;
} | null | undefined;

/** Phone may live on profile.phoneNumber, profile.phone, or emergency contact. */
export function resolveProfilePhone(
  ...sources: Array<PhoneSource | string | null | undefined>
): string | undefined {
  for (const source of sources) {
    if (typeof source === "string") {
      const trimmed = source.trim();
      if (trimmed) return trimmed;
      continue;
    }
    const candidates = [
      source?.phoneNumber,
      source?.phone,
      source?.emergencyContact?.phoneNumber,
      source?.emergencyContact?.phone,
    ];
    for (const value of candidates) {
      const trimmed = value?.trim();
      if (trimmed) return trimmed;
    }
  }
  return undefined;
}

export function profileHasPhone(
  ...sources: Array<PhoneSource | string | null | undefined>
): boolean {
  return isValidPhoneNumber(resolveProfilePhone(...sources));
}

export function formatPhoneDisplayLine(
  ...sources: Array<PhoneSource | string | null | undefined>
): string | undefined {
  return resolveProfilePhone(...sources);
}
