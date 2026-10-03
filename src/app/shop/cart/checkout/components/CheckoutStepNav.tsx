"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import { buttonPrimaryFull, buttonSecondary } from "@/common/ui/buttonClasses";
import type { CheckoutStickySummaryLine } from "@/lib/checkout/checkoutSummaryTotals";
import type { CheckoutStep } from "./CheckoutStepper";

type CheckoutStepNavProps = {
  onBack?: () => void;
  onContinue?: () => void;
  continueLabel?: string;
  backLabel?: string;
  continueDisabled?: boolean;
  checkoutGrandTotalNgN?: number;
  itemCount?: number;
  summaryLines?: CheckoutStickySummaryLine[];
  summaryLoading?: boolean;
  /** When false, only the inline desktop nav is shown (e.g. confirm step). */
  showMobileSticky?: boolean;
};

const formatCurrency = (amount: number): string =>
  amount.toLocaleString("en-NG");

function NavButtons({
  onBack,
  onContinue,
  continueLabel,
  backLabel = "Back",
  continueDisabled = false,
  className,
}: Omit<
  CheckoutStepNavProps,
  | "checkoutGrandTotalNgN"
  | "showMobileSticky"
  | "itemCount"
  | "summaryLines"
  | "summaryLoading"
> & {
  className: string;
}) {
  if (!onBack && !onContinue) return null;

  return (
    <div className={`flex gap-3 ${className}`}>
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className={`${buttonSecondary} flex-1`}
        >
          {backLabel}
        </button>
      ) : null}
      {onContinue ? (
        <button
          type="button"
          onClick={onContinue}
          disabled={continueDisabled}
          className={`${buttonPrimaryFull} flex-1 disabled:opacity-50`}
        >
          {continueLabel}
        </button>
      ) : null}
    </div>
  );
}

function StickySummaryPeek({
  checkoutGrandTotalNgN,
  itemCount,
  summaryLines,
  summaryLoading,
}: {
  checkoutGrandTotalNgN?: number;
  itemCount?: number;
  summaryLines?: CheckoutStickySummaryLine[];
  summaryLoading?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasTotal = checkoutGrandTotalNgN !== undefined;
  const hasBreakdown = Boolean(summaryLines && summaryLines.length > 0);
  const canExpand = hasTotal && hasBreakdown;

  if (!hasTotal && !summaryLoading) return null;

  if (summaryLoading && !hasTotal) {
    return (
      <div className="mb-3">
        <Paragraph1 className="m-0 text-gray-500 text-sm">
          Calculating total...
        </Paragraph1>
      </div>
    );
  }

  if (!hasTotal) return null;

  const itemLabel =
    itemCount === 1 ? "1 item" : `${itemCount ?? 0} items`;

  return (
    <div className="mb-3">
      {canExpand ? (
        <button
          type="button"
          onClick={() => setExpanded((open) => !open)}
          aria-expanded={expanded}
          className="flex justify-between items-center gap-3 w-full text-left"
        >
          <Paragraph1 className="m-0 font-medium text-gray-900 text-sm">
            {itemCount !== undefined ? `${itemLabel} · ` : ""}
            ₦{formatCurrency(checkoutGrandTotalNgN)}
          </Paragraph1>
          {expanded ? (
            <ChevronUp size={18} className="text-gray-500 shrink-0" />
          ) : (
            <ChevronDown size={18} className="text-gray-500 shrink-0" />
          )}
        </button>
      ) : (
        <div className="flex justify-between items-center gap-4">
          <Paragraph1 className="m-0 text-gray-600 text-sm">
            {itemCount !== undefined ? itemLabel : "Total"}
          </Paragraph1>
          <Paragraph1 className="m-0 font-bold text-gray-900 text-lg">
            ₦{formatCurrency(checkoutGrandTotalNgN)}
          </Paragraph1>
        </div>
      )}

      {expanded && hasBreakdown ? (
        <div className="space-y-2 mt-3 pt-3 border-gray-100 border-t">
          {summaryLines?.map((line) => (
            <div
              key={line.label}
              className="flex justify-between items-center gap-3 text-sm"
            >
              <Paragraph1 className="m-0 text-gray-600">{line.label}</Paragraph1>
              <Paragraph1 className="m-0 font-medium text-gray-900">
                ₦{formatCurrency(line.amount)}
              </Paragraph1>
            </div>
          ))}
          <div className="flex justify-between items-center gap-3 pt-2 border-gray-100 border-t font-semibold text-sm">
            <Paragraph1 className="m-0 text-gray-900">Total</Paragraph1>
            <Paragraph1 className="m-0 text-gray-900">
              ₦{formatCurrency(checkoutGrandTotalNgN)}
            </Paragraph1>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function CheckoutStepNav({
  onBack,
  onContinue,
  continueLabel,
  backLabel = "Back",
  continueDisabled = false,
  checkoutGrandTotalNgN,
  itemCount,
  summaryLines,
  summaryLoading,
  showMobileSticky = true,
}: CheckoutStepNavProps) {
  const showSticky =
    showMobileSticky && (onBack !== undefined || onContinue !== undefined);

  return (
    <>
      <NavButtons
        onBack={onBack}
        onContinue={onContinue}
        continueLabel={continueLabel}
        backLabel={backLabel}
        continueDisabled={continueDisabled}
        className="hidden xl:flex pt-4"
      />

      {showSticky ? (
        <NavButtons
          onBack={onBack}
          onContinue={onContinue}
          continueLabel={continueLabel}
          backLabel={backLabel}
          continueDisabled={continueDisabled}
          className="xl:hidden pt-6"
        />
      ) : null}

      {showSticky ? (
        <div
          className="xl:hidden fixed inset-x-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur-sm px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
          style={{
            bottom: "calc(3.25rem + env(safe-area-inset-bottom, 0px))",
          }}
        >
          <StickySummaryPeek
            checkoutGrandTotalNgN={checkoutGrandTotalNgN}
            itemCount={itemCount}
            summaryLines={summaryLines}
            summaryLoading={summaryLoading}
          />
          <NavButtons
            onBack={onBack}
            onContinue={onContinue}
            continueLabel={continueLabel}
            backLabel={backLabel}
            continueDisabled={continueDisabled}
            className="pt-0"
          />
        </div>
      ) : null}
    </>
  );
}

export function checkoutStepContinueLabel(step: CheckoutStep): string {
  return step === 1 ? "Continue to payment" : "Continue";
}
