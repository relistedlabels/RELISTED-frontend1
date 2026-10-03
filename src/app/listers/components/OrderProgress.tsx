"use client";

// ENDPOINTS: GET /api/listers/orders/:orderId/progress (current order status/step)

import { Check, Package, RotateCcw, Truck } from "lucide-react";
import { Fragment } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import {
  isListerResaleOrder,
  isResaleItem,
} from "@/lib/listers/listerOrderRow";

const rentalSteps = [
  { label: "Shipped", shortLabel: "Shipped", icon: Truck },
  { label: "Rental period", shortLabel: "Rental", icon: Package },
  { label: "Return pickup", shortLabel: "Return", icon: RotateCcw },
  { label: "Completed", shortLabel: "Complete", icon: Check },
];

const resaleSteps = [
  { label: "Shipped", shortLabel: "Shipped", icon: Truck },
  { label: "Completed", shortLabel: "Complete", icon: Check },
];

interface OrderProgressProps {
  currentStep?: number;
  orderData?: any;
  clickedItem?: any;
}

const OrderProgress: React.FC<OrderProgressProps> = ({
  currentStep: propCurrentStep = 0,
  orderData,
  clickedItem,
}) => {
  // Check if the clicked item or order is resale
  const isResale = isResaleItem(clickedItem) || isListerResaleOrder(orderData);
  const steps = isResale ? resaleSteps : rentalSteps;

  // Map API order / timeline status → step index (timeline uses lowercase API slugs e.g. intransit, confirmed).
  let currentStep = propCurrentStep;
  if (orderData) {
    const raw = String(
      orderData.timeline?.currentStep ?? orderData.status ?? "",
    )
      .toLowerCase()
      .replace(/-/g, "_");

    if (isResale) {
      const resaleByApi: Record<string, number> = {
        processing: 0,
        accepted: 0,
        confirmed: 0,
        intransit: 0,
        delivered: 0,
        active: 0,
        completed: 1,
        returned: 1,
        return_due: 0,
        in_dispute: 0,
        cancelled: 0,
        rejected: 0,
      };
      const idx = resaleByApi[raw];
      if (idx !== undefined) currentStep = idx;
    } else {
      const rentalByApi: Record<string, number> = {
        processing: 0,
        accepted: 0,
        confirmed: 0,
        intransit: 0,
        delivered: 0,
        active: 1,
        return_due: 1,
        returned: 2,
        completed: 3,
        in_dispute: 1,
        cancelled: 0,
        rejected: 0,
      };
      const idx = rentalByApi[raw];
      if (idx !== undefined) currentStep = idx;
    }
  }
  currentStep = Math.max(0, Math.min(steps.length - 1, currentStep));
  return (
    <section className="w-full rounded-2xl border border-gray-200 bg-white p-4">
      <Paragraph1 className="mb-4 font-semibold text-gray-900 text-sm">
        Order progress
      </Paragraph1>

      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <ol className="mt-3 flex items-start" aria-label="Order steps">
            {steps.map((step, index) => {
              const isComplete = index < currentStep;
              const isCurrent = index === currentStep;
              const Icon = step.icon;
              return (
                <Fragment key={step.label}>
                  <li
                    className="flex min-w-0 flex-1 flex-col items-center gap-1 text-center"
                    aria-current={isCurrent ? "step" : undefined}
                  >
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full ${
                        isComplete || isCurrent
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      <Icon className="h-3 w-3" aria-hidden />
                    </span>
                    <span
                      className={`max-w-14 text-[9px] leading-tight ${
                        isCurrent
                          ? "font-semibold text-gray-900"
                          : isComplete
                            ? "text-gray-600"
                            : "text-gray-400"
                      }`}
                    >
                      {step.shortLabel}
                    </span>
                  </li>
                  {index < steps.length - 1 && (
                    <span
                      aria-hidden
                      className={`mt-3 h-px flex-1 ${
                        isComplete ? "bg-gray-900" : "bg-gray-200"
                      }`}
                    />
                  )}
                </Fragment>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default OrderProgress;
