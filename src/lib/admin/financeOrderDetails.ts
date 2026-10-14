export interface FinanceOrderDetails {
  isFinanceContext: boolean;
  dateFrom?: string;
  dateTo?: string;
}

const isValidDate = (value: string | null): value is string => {
  if (value === null || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
};

export function buildFinanceOrdersHref(
  adminId: string,
  from: string,
  to: string,
): string {
  const inclusiveTo = new Date(`${to.slice(0, 10)}T00:00:00.000Z`);
  inclusiveTo.setUTCDate(inclusiveTo.getUTCDate() - 1);
  const params = new URLSearchParams({
    financeDetail: "1",
    dateFrom: from.slice(0, 10),
    dateTo: inclusiveTo.toISOString().slice(0, 10),
  });
  return `/admin/${encodeURIComponent(adminId)}/orders?${params.toString()}`;
}

export function parseFinanceOrderDetails(search: string): FinanceOrderDetails {
  const params = new URLSearchParams(search);
  if (params.get("financeDetail") !== "1") {
    return { isFinanceContext: false };
  }

  const dateFrom = params.get("dateFrom");
  const dateTo = params.get("dateTo");
  const validFrom = isValidDate(dateFrom) ? dateFrom : undefined;
  const validTo = isValidDate(dateTo) ? dateTo : undefined;

  if (validFrom && validTo && validFrom > validTo) {
    return { isFinanceContext: true };
  }
  return {
    isFinanceContext: true,
    dateFrom: validFrom,
    dateTo: validTo,
  };
}
