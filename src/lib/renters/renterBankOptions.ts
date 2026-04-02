/**
 * Banks for renter payout / profile bank sync. Codes are common NIP/CBN values.
 * PUT /api/renters/profile expects bankAccountInfo.bankCode for BankAccount rows.
 */
export const RENTER_BANK_OPTIONS: ReadonlyArray<{
  bankName: string;
  bankCode: string;
}> = [
  { bankName: "Access Bank", bankCode: "044" },
  { bankName: "Citibank Nigeria", bankCode: "023" },
  { bankName: "Ecobank Nigeria", bankCode: "050" },
  { bankName: "Fidelity Bank", bankCode: "070" },
  { bankName: "First Bank of Nigeria", bankCode: "011" },
  { bankName: "First City Monument Bank (FCMB)", bankCode: "214" },
  { bankName: "Guaranty Trust Bank (GTBank)", bankCode: "058" },
  { bankName: "Heritage Bank", bankCode: "030" },
  { bankName: "Jaiz Bank", bankCode: "301" },
  { bankName: "Keystone Bank", bankCode: "082" },
  { bankName: "Kuda Bank", bankCode: "50211" },
  { bankName: "Polaris Bank", bankCode: "076" },
  { bankName: "Providus Bank", bankCode: "101" },
  { bankName: "Stanbic IBTC Bank", bankCode: "221" },
  { bankName: "Standard Chartered Bank", bankCode: "068" },
  { bankName: "Sterling Bank", bankCode: "232" },
  { bankName: "SunTrust Bank", bankCode: "100" },
  { bankName: "Titan Trust Bank", bankCode: "102" },
  { bankName: "United Bank for Africa (UBA)", bankCode: "033" },
  { bankName: "Union Bank of Nigeria", bankCode: "032" },
  { bankName: "Unity Bank", bankCode: "215" },
  { bankName: "Wema Bank", bankCode: "035" },
  { bankName: "Zenith Bank", bankCode: "057" },
];

export function resolveRenterBankByName(displayName: string) {
  const n = displayName.trim().toLowerCase();
  if (!n) return undefined;
  const exact = RENTER_BANK_OPTIONS.find(
    (b) => b.bankName.toLowerCase() === n,
  );
  if (exact) return exact;
  return RENTER_BANK_OPTIONS.find(
    (b) =>
      b.bankName.toLowerCase().includes(n) ||
      n.includes(b.bankName.toLowerCase().split(/\s+/)[0] ?? ""),
  );
}
