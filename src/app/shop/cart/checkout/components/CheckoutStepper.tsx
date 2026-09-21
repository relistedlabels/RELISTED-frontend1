"use client";

import { Fragment } from "react";
import { Paragraph1 } from "@/common/ui/Text";

export type CheckoutStep = 1 | 2;

export const CHECKOUT_STEPS: Array<{ step: CheckoutStep; label: string }> = [
  { step: 1, label: "Delivery" },
  { step: 2, label: "Payment" },
];

type CheckoutStepperProps = {
  currentStep: CheckoutStep;
  onStepChange?: (step: CheckoutStep) => void;
};

export default function CheckoutStepper({
  currentStep,
  onStepChange,
}: CheckoutStepperProps) {
  return (
    <nav
      aria-label="Checkout progress"
      className="mb-6 sm:mb-10 flex w-full max-w-md sm:max-w-none mx-auto sm:mx-0 items-start sm:items-center justify-center sm:gap-2"
    >
      {CHECKOUT_STEPS.map(({ step, label }, index) => {
        const isActive = step === currentStep;
        const isComplete = step < currentStep;
        const canNavigate = isComplete && onStepChange;
        const connectorActive = isComplete || isActive;

        return (
          <Fragment key={step}>
            {index > 0 ? (
              <div
                className={`mt-[1.125rem] sm:mt-0 h-px flex-1 min-w-10 max-w-20 sm:flex-none sm:w-8 xl:w-12 shrink-0 ${
                  connectorActive ? "bg-black" : "bg-gray-200"
                }`}
                aria-hidden
              />
            ) : null}

            <button
              type="button"
              disabled={!canNavigate}
              onClick={() => canNavigate && onStepChange?.(step)}
              className={`flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 flex-1 sm:flex-none min-w-0 sm:rounded-full sm:px-3 sm:py-1.5 sm:transition-colors ${
                canNavigate ? "cursor-pointer" : "cursor-default"
              } ${
                isActive
                  ? "sm:bg-black sm:text-white"
                  : isComplete
                    ? "sm:bg-gray-100 sm:text-gray-900 sm:hover:bg-gray-200"
                    : "sm:bg-gray-50 sm:text-gray-400"
              }`}
              aria-current={isActive ? "step" : undefined}
              aria-label={
                isActive
                  ? `${label}, current step`
                  : isComplete
                    ? `${label}, completed step`
                    : `${label}, upcoming step`
              }
            >
              <span
                className={`flex h-9 w-9 sm:h-6 sm:w-6 items-center justify-center rounded-full text-xs font-bold shrink-0 ${
                  isActive
                    ? "bg-black text-white ring-2 ring-black ring-offset-2 sm:bg-white sm:text-black sm:ring-0"
                    : isComplete
                      ? "bg-black text-white"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {step}
              </span>
              <span
                className={`sm:hidden text-xs leading-none text-center whitespace-nowrap ${
                  isActive
                    ? "font-semibold text-black"
                    : isComplete
                      ? "text-gray-700 font-medium"
                      : "text-gray-400"
                }`}
              >
                {label}
              </span>
              <Paragraph1 className="hidden sm:block m-0 text-inherit text-sm font-semibold">
                {label}
              </Paragraph1>
            </button>
          </Fragment>
        );
      })}
    </nav>
  );
}
