/**
 * Bank name + code for renter/lister payout (PUT profile bankAccountInfo).
 * `FALLBACK_NG_BANK_OPTIONS` is the canonical NG list for `useNgBankOptions` (no remote banks API).
 */

export type RenterBankOption = {
  bankName: string;
  bankCode: string;
};

function dedupeAndSortBanks(items: RenterBankOption[]): RenterBankOption[] {
  const byCode = new Map<string, RenterBankOption>();
  for (const row of items) {
    const code = String(row.bankCode ?? "").trim();
    const name = String(row.bankName ?? "").trim();
    if (!code || !name) continue;
    if (!byCode.has(code)) byCode.set(code, { bankName: name, bankCode: code });
  }
  return [...byCode.values()].sort((a, b) =>
    a.bankName.localeCompare(b.bankName, undefined, { sensitivity: "base" }),
  );
}

/**
 * Expanded static list (major commercial + common digital / MFBs).
 * Aligned with common NIP-style codes; update here when the directory changes.
 */
const RAW_FALLBACK_NG_BANKS: RenterBankOption[] = [
  { bankName: "9mobile 9Payment Service Bank", bankCode: "120001" },
  { bankName: "Abbey Mortgage Bank", bankCode: "404" },
  { bankName: "Access Bank", bankCode: "044" },
  { bankName: "Access Bank (Diamond)", bankCode: "063" },
  { bankName: "ALAT by WEMA", bankCode: "035A" },
  { bankName: "Airtel Smartcash PSB", bankCode: "120004" },
  { bankName: "ASO Savings and Loans", bankCode: "401" },
  { bankName: "Carbon", bankCode: "565" },
  { bankName: "Citibank Nigeria", bankCode: "023" },
  { bankName: "Coronation Merchant Bank", bankCode: "559" },
  { bankName: "Ecobank Nigeria", bankCode: "050" },
  { bankName: "Ekondo Microfinance Bank", bankCode: "098" },
  { bankName: "Eyowo", bankCode: "50126" },
  { bankName: "Fairmoney Microfinance Bank", bankCode: "51318" },
  { bankName: "Fidelity Bank", bankCode: "070" },
  { bankName: "First Bank of Nigeria", bankCode: "011" },
  { bankName: "First City Monument Bank (FCMB)", bankCode: "214" },
  { bankName: "FSDH Merchant Bank", bankCode: "501" },
  { bankName: "Globus Bank", bankCode: "00103" },
  { bankName: "GoMoney", bankCode: "100022" },
  { bankName: "Guaranty Trust Bank (GTBank)", bankCode: "058" },
  { bankName: "Heritage Bank", bankCode: "030" },
  { bankName: "HopePSB", bankCode: "120002" },
  { bankName: "Jaiz Bank", bankCode: "301" },
  { bankName: "Keystone Bank", bankCode: "082" },
  { bankName: "Kuda Bank", bankCode: "50211" },
  { bankName: "Lotus Bank", bankCode: "303" },
  { bankName: "Moniepoint MFB", bankCode: "50515" },
  { bankName: "MTN Momo PSB", bankCode: "120003" },
  { bankName: "NOVA Bank", bankCode: "561" },
  { bankName: "OPay", bankCode: "999992" },
  { bankName: "Optimus Bank", bankCode: "107" },
  { bankName: "Paga", bankCode: "100002" },
  { bankName: "PalmPay", bankCode: "999991" },
  { bankName: "Parallex Bank", bankCode: "104" },
  { bankName: "Parkway (ReadyCash)", bankCode: "311" },
  { bankName: "Polaris Bank", bankCode: "076" },
  { bankName: "PremiumTrust Bank", bankCode: "105" },
  { bankName: "Providus Bank", bankCode: "101" },
  { bankName: "Rand Merchant Bank", bankCode: "502" },
  { bankName: "Rubies MFB", bankCode: "125" },
  { bankName: "Signature Bank", bankCode: "106" },
  { bankName: "Sparkle Microfinance Bank", bankCode: "51310" },
  { bankName: "Stanbic IBTC Bank", bankCode: "221" },
  { bankName: "Standard Chartered Bank", bankCode: "068" },
  { bankName: "Sterling Bank", bankCode: "232" },
  { bankName: "Summit Bank", bankCode: "00305" },
  { bankName: "SunTrust Bank", bankCode: "100" },
  { bankName: "TAJ Bank", bankCode: "302" },
  { bankName: "Tatum Bank", bankCode: "109" },
  { bankName: "Titan Trust Bank", bankCode: "102" },
  { bankName: "United Bank for Africa (UBA)", bankCode: "033" },
  { bankName: "Union Bank of Nigeria", bankCode: "032" },
  { bankName: "Unity Bank", bankCode: "215" },
  { bankName: "VFD Microfinance Bank", bankCode: "566" },
  { bankName: "Wema Bank", bankCode: "035" },
  { bankName: "Zenith Bank", bankCode: "057" },
];

export const FALLBACK_NG_BANK_OPTIONS: ReadonlyArray<RenterBankOption> =
  dedupeAndSortBanks(RAW_FALLBACK_NG_BANKS);

/** @deprecated Use useNgBankOptions().bankOptions or FALLBACK_NG_BANK_OPTIONS */
export const RENTER_BANK_OPTIONS = FALLBACK_NG_BANK_OPTIONS;

export function resolveRenterBankByName(
  displayName: string,
  banksList: ReadonlyArray<RenterBankOption>,
): RenterBankOption | undefined {
  const n = displayName.trim().toLowerCase();
  if (!n) return undefined;
  const exact = banksList.find((b) => b.bankName.toLowerCase() === n);
  if (exact) return exact;
  return banksList.find(
    (b) =>
      b.bankName.toLowerCase().includes(n) ||
      n.includes(b.bankName.toLowerCase().split(/\s+/)[0] ?? ""),
  );
}
