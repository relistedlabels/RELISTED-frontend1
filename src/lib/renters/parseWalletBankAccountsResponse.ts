import type { BankAccount } from "@/lib/api/renters";

/** Normalizes GET wallet bank-accounts envelope (and loose shapes) for React Query. */
export function parseWalletBankAccountsResponse(body: unknown): {
  bankAccounts: BankAccount[];
  totalAccounts: number;
} {
  const empty = { bankAccounts: [] as BankAccount[], totalAccounts: 0 };
  if (!body || typeof body !== "object") return empty;
  const root = body as Record<string, unknown>;
  const data = root.data;

  // Legacy: { success, data: BankAccount[] }
  if (Array.isArray(data)) {
    const bankAccounts = data as BankAccount[];
    return { bankAccounts, totalAccounts: bankAccounts.length };
  }

  const container: Record<string, unknown> =
    data && typeof data === "object" ? (data as Record<string, unknown>) : root;
  const rawList = container.bankAccounts;
  if (!Array.isArray(rawList)) return empty;
  const bankAccounts = rawList as BankAccount[];
  const totalAccounts =
    typeof container.totalAccounts === "number"
      ? container.totalAccounts
      : bankAccounts.length;
  return { bankAccounts, totalAccounts };
}
