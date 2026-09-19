import { isResaleItem } from "@/lib/listers/listerOrderRow";

type ProductDetail = {
  collateralPrice?: number;
  originalValue?: number;
};

export type CartLinePricingInput = {
  isResale?: boolean;
  rentalPrice?: number;
  totalPrice?: number;
  purchaseTotal?: number;
  securityDeposit?: number;
  productDetail?: ProductDetail | Record<string, unknown> | null;
};

export function lineIsResale(item: CartLinePricingInput): boolean {
  return item.isResale === true || isResaleItem(item as Record<string, unknown>);
}

export function resolveLineRentalPrice(item: CartLinePricingInput): number {
  if (lineIsResale(item)) {
    return Number(item.purchaseTotal ?? item.totalPrice ?? 0) || 0;
  }
  return Number(item.rentalPrice ?? item.totalPrice ?? 0) || 0;
}

export function resolveLineSecurityDeposit(item: CartLinePricingInput): number {
  if (lineIsResale(item)) return 0;
  const fromLine = Number(item.securityDeposit ?? 0);
  if (fromLine > 0) return fromLine;
  const pd = item.productDetail as ProductDetail | undefined;
  return Number(pd?.collateralPrice ?? pd?.originalValue ?? 0) || 0;
}
