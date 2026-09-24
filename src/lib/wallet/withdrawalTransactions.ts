export type NormalizedWithdrawal = {
  id: string;
  description: string;
  amount: number;
  date: string;
  status: string;
  reference?: string;
};

export function isWithdrawalTransaction(description: string): boolean {
  return /withdrawal/i.test(description ?? "");
}

export function extractWithdrawalReference(description: string): string | undefined {
  const match = description.match(/Ref:\s*([^)]+)\)/i);
  return match?.[1]?.trim();
}

export function formatWithdrawalStatus(status: string): {
  label: string;
  className: string;
} {
  const normalized = String(status ?? "").toUpperCase();

  if (normalized === "SUCCESS" || normalized === "COMPLETED") {
    return { label: "Completed", className: "bg-green-100 text-green-800" };
  }
  if (normalized === "PENDING" || normalized === "PROCESSING") {
    return { label: "Pending", className: "bg-yellow-100 text-orange-800" };
  }
  if (normalized === "FAILED") {
    return { label: "Failed", className: "bg-red-100 text-red-800" };
  }

  return {
    label: status || "Unknown",
    className: "bg-gray-100 text-gray-800",
  };
}

export function normalizeListerWithdrawals(data: unknown): NormalizedWithdrawal[] {
  if (!data || typeof data !== "object") return [];

  const payload = data as Record<string, unknown>;
  const raw = payload.data;
  const rows = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object" && Array.isArray((raw as { transactions?: unknown[] }).transactions)
      ? (raw as { transactions: Record<string, unknown>[] }).transactions
      : [];

  return rows
    .map((row) => {
      const description = String(row.description ?? row.note ?? "");
      const id = String(row.id ?? row.transactionId ?? "");
      const amount = Number(row.amount ?? 0);
      const date = String(row.date ?? row.timestamp ?? row.createdAt ?? "");
      const status = String(row.status ?? "PENDING");

      return {
        id,
        description,
        amount,
        date,
        status,
        reference: extractWithdrawalReference(description),
      };
    })
    .filter((row) => row.id && isWithdrawalTransaction(row.description));
}

export function normalizeRenterWithdrawals(
  transactions: Array<{
    id: string;
    description: string;
    amount: number;
    date?: string;
    timestamp?: string;
    status: string;
    type?: string;
  }>,
): NormalizedWithdrawal[] {
  return transactions
    .filter(
      (row) =>
        row.type === "withdrawal" || isWithdrawalTransaction(row.description),
    )
    .map((row) => ({
      id: row.id,
      description: row.description,
      amount: row.amount,
      date: row.timestamp || row.date || "",
      status: row.status,
      reference: extractWithdrawalReference(row.description),
    }));
}
