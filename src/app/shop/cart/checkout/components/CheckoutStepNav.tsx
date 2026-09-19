"use client";

import { Paragraph1 } from "@/common/ui/Text";
import { buttonPrimaryFull, buttonSecondary } from "@/common/ui/buttonClasses";
import type { CheckoutStep } from "./CheckoutStepper";

type CheckoutStepNavProps = {
  onBack?: () => void;
  onContinue?: () => void;
  continueLabel?: string;
  backLabel?: string;
  continueDisabled?: boolean;
  checkoutGrandTotalNgN?: number;
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
}: Omit<CheckoutStepNavProps, "checkoutGrandTotalNgN" | "showMobileSticky"> & {
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

export default function CheckoutStepNav({
  onBack,
  onContinue,
  continueLabel,
  backLabel = "Back",
  continueDisabled = false,
  checkoutGrandTotalNgN,
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
        <div
          className="xl:hidden fixed inset-x-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur-sm px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
          style={{
            bottom: "calc(3.25rem + env(safe-area-inset-bottom, 0px))",
          }}
        >
          {checkoutGrandTotalNgN !== undefined ? (
            <div className="flex justify-between items-center gap-4 mb-3">
              <Paragraph1 className="m-0 text-gray-600 text-sm">Total</Paragraph1>
              <Paragraph1 className="m-0 font-bold text-gray-900 text-lg">
                ₦{formatCurrency(checkoutGrandTotalNgN)}
              </Paragraph1>
            </div>
          ) : null}
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
  if (step === 1) return "Continue to shipping";
  if (step === 2) return "Continue to payment";
  if (step === 3) return "Review order";
  return "Complete order";
}
