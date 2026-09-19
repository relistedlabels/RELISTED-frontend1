"use client";

import Image from "next/image";
import { memo } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { resolveCheckoutDisplayLine } from "@/lib/checkout/checkoutLineDisplay";
import { useListerProfile } from "@/lib/queries/shop/useListerProfile";

export type CheckoutListerGroup = {
  listerId: string;
  items: Array<Record<string, unknown>>;
};

type CheckoutOrderItemsProps = {
  listerGroups: CheckoutListerGroup[];
  /** compact: main checkout steps; sidebar: order summary with prices */
  variant?: "compact" | "sidebar";
  className?: string;
};

const formatCurrency = (amount: number): string =>
  amount.toLocaleString("en-NG");

const ListerGroupBlock = memo(function ListerGroupBlock({
  group,
  variant,
}: {
  group: CheckoutListerGroup;
  variant: "compact" | "sidebar";
}) {
  const { data: listerData, isLoading } = useListerProfile(group.listerId);
  const listerName =
    listerData?.name ||
    (typeof group.items[0]?.listerName === "string"
      ? group.items[0].listerName
      : "") ||
    "Lister";

  const thumbClass =
    variant === "sidebar"
      ? "h-14 w-11"
      : "h-12 w-10";

  return (
    <div className="space-y-2">
      <Paragraph1 className="font-semibold text-[11px] text-gray-500 uppercase tracking-wide">
        {isLoading ? (
          <span className="inline-block bg-gray-200 rounded w-20 h-3 animate-pulse" />
        ) : (
          <>From {listerName}</>
        )}
      </Paragraph1>

      <ul className="space-y-2.5">
        {group.items.map((item) => {
          const line = resolveCheckoutDisplayLine(item);
          return (
            <li
              key={line.rowKey}
              className="flex items-center gap-3 min-w-0"
            >
              <div
                className={`relative ${thumbClass} shrink-0 overflow-hidden rounded-md border border-gray-100 bg-gray-100`}
              >
                {line.productImageUrl ? (
                  <Image
                    src={line.productImageUrl}
                    alt={line.productName}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : null}
              </div>

              <div className="min-w-0 flex-1">
                <Paragraph1 className="truncate font-medium text-gray-900 text-sm leading-snug">
                  {line.productName}
                </Paragraph1>
                <Paragraph1 className="text-gray-500 text-xs leading-snug">
                  {line.subtitle}
                </Paragraph1>
              </div>

              {variant === "sidebar" && line.totalPrice > 0 ? (
                <Paragraph1 className="shrink-0 font-semibold text-gray-900 text-sm tabular-nums">
                  ₦{formatCurrency(line.totalPrice)}
                </Paragraph1>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
});

ListerGroupBlock.displayName = "ListerGroupBlock";

export default function CheckoutOrderItems({
  listerGroups,
  variant = "compact",
  className = "",
}: CheckoutOrderItemsProps) {
  const groups = listerGroups.filter((g) => g.items.length > 0);
  if (groups.length === 0) return null;

  const itemCount = groups.reduce((n, g) => n + g.items.length, 0);
  const scrollManyItems =
    variant === "compact" && itemCount > 4
      ? "max-h-52 overflow-y-auto pr-1"
      : "";

  return (
    <div
      className={`space-y-4 ${scrollManyItems} ${className}`.trim()}
      data-testid="checkout-order-items"
    >
      {groups.map((group, index) => (
        <div
          key={group.listerId}
          className={
            index > 0 ? "pt-4 border-t border-gray-100" : undefined
          }
        >
          <ListerGroupBlock group={group} variant={variant} />
        </div>
      ))}
    </div>
  );
}
