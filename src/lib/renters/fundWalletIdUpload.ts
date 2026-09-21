export const FUND_WALLET_ID_TYPE_OPTIONS = [
  { value: "NIN", label: "National ID (NIN)" },
  { value: "PASSPORT", label: "International passport" },
  { value: "DRIVERS_LICENSE", label: "Driver's licence" },
] as const;

export type FundWalletIdDocumentType =
  (typeof FUND_WALLET_ID_TYPE_OPTIONS)[number]["value"];

export function normalizeFundWalletIdType(idType: string): FundWalletIdDocumentType {
  const normalized = idType.toUpperCase().trim();
  const mapping: Record<string, FundWalletIdDocumentType> = {
    NATIONALID: "NIN",
    NATIONAL_ID: "NIN",
    NIN: "NIN",
    PASSPORT: "PASSPORT",
    DRIVERSLICENSE: "DRIVERS_LICENSE",
    DRIVERS_LICENSE: "DRIVERS_LICENSE",
    DRIVERS: "DRIVERS_LICENSE",
    DRIVER: "DRIVERS_LICENSE",
  };
  return mapping[normalized] ?? "NIN";
}

export function getFundWalletIdInputConfig(documentType: string): {
  maxLength: number;
  inputMode: "numeric" | "text";
} {
  const type = normalizeFundWalletIdType(documentType);
  if (type === "NIN") {
    return { maxLength: 11, inputMode: "numeric" };
  }
  if (type === "PASSPORT") {
    return { maxLength: 9, inputMode: "text" };
  }
  return { maxLength: 12, inputMode: "text" };
}

export function sanitizeFundWalletIdInput(
  documentType: string,
  raw: string,
): string {
  const type = normalizeFundWalletIdType(documentType);
  if (type === "NIN") {
    return raw.replace(/\D/g, "").slice(0, 11);
  }
  const cleaned = raw.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return cleaned.slice(0, type === "PASSPORT" ? 9 : 12);
}

export function validateFundWalletIdNumber(
  documentType: string,
  value: string,
): string | null {
  const type = normalizeFundWalletIdType(documentType);
  const v = value.trim();

  if (!v) return "Please enter your ID number.";

  if (type === "NIN") {
    if (!/^\d{11}$/.test(v)) return "Enter a valid NIN.";
    return null;
  }

  if (type === "PASSPORT") {
    if (!/^[A-Z0-9]{8,9}$/.test(v)) {
      return "Enter a valid passport number.";
    }
    return null;
  }

  if (!/^[A-Z0-9]{10,12}$/.test(v)) {
    return "Enter a valid licence number.";
  }
  return null;
}

export function isFundWalletIdNumberComplete(
  documentType: string,
  value: string,
): boolean {
  return validateFundWalletIdNumber(documentType, value) === null;
}
