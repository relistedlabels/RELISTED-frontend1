import type { Product } from "@/lib/api/admin/listings";
import { listingPriceDisplay } from "@/lib/product/listingPriceDisplay";

type ListingPriceSummaryProps = {
  product: Product & { listingType?: string; resalePrice?: number };
};

export function ListingPriceSummary({ product }: ListingPriceSummaryProps) {
  const price = listingPriceDisplay(product);
  const prices =
    price.listingType === "RENT_OR_RESALE"
      ? [
          { label: "Rent · per day", amount: price.primary.amount },
          { label: "Buy · one-time", amount: price.secondary?.amount ?? 0 },
        ]
      : [
          {
            label:
              price.listingType === "RESALE"
                ? "Buy · one-time"
                : "Rent · per day",
            amount: price.primary.amount,
          },
        ];

  return (
    <div className="space-y-2">
      {prices.map(({ label, amount }) => (
        <div
          key={label}
          className="flex min-w-0 items-center justify-between gap-3"
        >
          <span className="text-xs font-medium text-gray-600">{label}</span>
          <span className="text-sm font-semibold text-gray-900">
            ₦{amount.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}
