"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, X } from "lucide-react";
import Button from "@/common/ui/Button";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import {
  bottomSheetBackdrop,
  bottomSheetPanel,
} from "@/common/ui/dashboardClasses";
import DispatchWindowsScheduler from "@/app/shop/cart/checkout/components/DispatchWindowsScheduler";
import {
  buildDispatchWindowContexts,
  formatLagosDate,
  formatLagosTime,
  formatWindowRange,
  getSuggestedRentalCalendarStartYmd,
  type DispatchWindowContext,
  type DispatchWindowSelection,
  type DispatchWindowSelectionMap,
  type DispatchWindowsPayload,
  type ShipmentDispatchType,
} from "@/lib/checkout/dispatchWindows";
import { useDispatchScheduleClock } from "@/lib/checkout/useDispatchScheduleClock";
import {
  addCalendarDaysLocal,
  formatDateOnlyLocal,
} from "@/lib/dates/formatDateOnlyLocal";
import { lagosYmdMax } from "@/lib/vaultClosetSaleDates";

const DISPATCH_SLOT_MINUTES = 60;

const dispatchWindowMeta: Record<
  ShipmentDispatchType,
  { title: string; kicker: string; description: string }
> = {
  OUTBOUND: {
    title: "When should we deliver to you?",
    kicker: "Delivery to you",
    description:
      "Pick a time on your rental start day so the item reaches you when your rental begins. Delivery depends on lister availability.",
  },
  RETURN: {
    title: "When should we collect the return?",
    kicker: "Pickup from you",
    description:
      "Pick a time for us to collect the item from you after your rental ends.",
  },
  RESALE: {
    title: "When should we deliver?",
    kicker: "Your delivery",
    description: "Pick a time for us to drop off your purchase.",
  },
};

type RentalDispatchWindowPickerProps = {
  startDate: Date;
  rentalDays: number;
  enabled: boolean;
  panelOpen: boolean;
  applyDeliveryFloor?: boolean;
  closetEarliestDeliveryYmd?: string;
  onPayloadChange: (payload: DispatchWindowsPayload | undefined) => void;
};

export default function RentalDispatchWindowPicker({
  startDate,
  rentalDays,
  enabled,
  panelOpen,
  applyDeliveryFloor = false,
  closetEarliestDeliveryYmd,
  onPayloadChange,
}: RentalDispatchWindowPickerProps) {
  const dispatchScheduleClock = useDispatchScheduleClock();
  const [dispatchSelections, setDispatchSelections] =
    useState<DispatchWindowSelectionMap>({});
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [dispatchModalStep, setDispatchModalStep] = useState(0);

  const rentalStartDateIso = useMemo(
    () => formatDateOnlyLocal(startDate),
    [startDate],
  );

  const rentalReturnBaseIso = useMemo(
    () => formatDateOnlyLocal(addCalendarDaysLocal(startDate, rentalDays)),
    [startDate, rentalDays],
  );

  const dispatchContexts = useMemo<DispatchWindowContext[]>(() => {
    if (!enabled || rentalDays <= 0) return [];

    void dispatchScheduleClock;
    const closetOutboundMin =
      applyDeliveryFloor && closetEarliestDeliveryYmd
        ? lagosYmdMax(rentalStartDateIso, closetEarliestDeliveryYmd)
        : undefined;

    return buildDispatchWindowContexts([
      {
        type: "OUTBOUND",
        baseDate: rentalStartDateIso,
        minDate: closetOutboundMin,
        durationMinutes: DISPATCH_SLOT_MINUTES,
        title: dispatchWindowMeta.OUTBOUND.title,
        subtitle: dispatchWindowMeta.OUTBOUND.description,
        baseDateReason: applyDeliveryFloor
          ? "Earliest delivery follows the sale schedule"
          : undefined,
      },
      {
        type: "RETURN",
        baseDate: rentalReturnBaseIso,
        durationMinutes: DISPATCH_SLOT_MINUTES,
        title: dispatchWindowMeta.RETURN.title,
        subtitle: dispatchWindowMeta.RETURN.description,
      },
    ]);
  }, [
    enabled,
    rentalDays,
    rentalStartDateIso,
    rentalReturnBaseIso,
    dispatchScheduleClock,
    applyDeliveryFloor,
    closetEarliestDeliveryYmd,
  ]);

  useEffect(() => {
    if (dispatchContexts.length === 0) {
      setDispatchSelections({});
      return;
    }
    setDispatchSelections((prev) => {
      const next = { ...prev } as DispatchWindowSelectionMap;
      let changed = false;
      dispatchContexts.forEach((ctx) => {
        const existing = next[ctx.type];
        if (!existing || existing.mode === "DEFAULT") {
          next[ctx.type] = {
            type: ctx.type,
            window: ctx.suggested.window,
            mode: "DEFAULT",
            baseDate: ctx.suggested.baseDate,
            scheduledDate: ctx.suggested.scheduledDate,
            rolledForwardDays: ctx.suggested.rolledForwardDays,
          } satisfies DispatchWindowSelection;
          changed = true;
        }
      });
      (Object.keys(next) as ShipmentDispatchType[]).forEach((type) => {
        if (!dispatchContexts.some((ctx) => ctx.type === type)) {
          delete next[type];
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [dispatchContexts]);

  useEffect(() => {
    if (!panelOpen) {
      setIsDispatchModalOpen(false);
      setDispatchModalStep(0);
    }
  }, [panelOpen]);

  useEffect(() => {
    if (!isDispatchModalOpen) setDispatchModalStep(0);
  }, [isDispatchModalOpen]);

  const dispatchWindowsPayload = useMemo<DispatchWindowsPayload | undefined>(
    () => {
      if (dispatchContexts.length === 0) return undefined;
      const payload: DispatchWindowsPayload = {};
      dispatchContexts.forEach((ctx) => {
        const selection = dispatchSelections[ctx.type];
        if (selection?.window) payload[ctx.type] = selection.window;
      });
      return Object.keys(payload).length > 0 ? payload : undefined;
    },
    [dispatchContexts, dispatchSelections],
  );

  useEffect(() => {
    onPayloadChange(dispatchWindowsPayload);
  }, [dispatchWindowsPayload, onPayloadChange]);

  const handleDispatchSelectionChange = useCallback(
    (
      type: ShipmentDispatchType,
      selection: DispatchWindowSelection | undefined,
    ) => {
      setDispatchSelections((prev) => {
        const next = { ...prev } as DispatchWindowSelectionMap;
        if (!selection) delete next[type];
        else next[type] = selection;
        return next;
      });
    },
    [],
  );

  const openDispatchModal = useCallback((step = 0) => {
    setDispatchModalStep(step);
    setIsDispatchModalOpen(true);
  }, []);

  const totalDispatchSteps = dispatchContexts.length;
  const activeDispatchContext =
    totalDispatchSteps > 0 ? dispatchContexts[dispatchModalStep] : undefined;
  const stepProgress =
    totalDispatchSteps > 0
      ? ((dispatchModalStep + 1) / totalDispatchSteps) * 100
      : 100;

  if (!enabled || dispatchContexts.length === 0) return null;

  return (
    <>
      <div>
        <Paragraph1 className="mb-3 font-bold text-gray-800 text-xs uppercase tracking-wider">
          Delivery and pickup times
        </Paragraph1>

        <div className="space-y-3 bg-linear-to-b from-neutral-50 to-neutral-50/40 p-3 border border-gray-200 rounded-xl">
          <div className="bg-white shadow-sm p-4 border border-gray-200/90 rounded-lg">
            <div className="relative pl-6">
              <div
                className="absolute top-2.5 bottom-2.5 left-[7px] w-0.5 bg-gray-300"
                aria-hidden
              />

              <div className="space-y-1">
                {dispatchContexts.map((ctx, index) => {
                  const selection = dispatchSelections[ctx.type];
                  const window = selection?.window ?? ctx.suggested.window;
                  const meta = dispatchWindowMeta[ctx.type];
                  const isLast = index === dispatchContexts.length - 1;

                  return (
                    <button
                      key={ctx.type}
                      type="button"
                      aria-label={`Edit ${meta?.kicker?.toLowerCase() ?? "time window"}: ${formatWindowRange(window)}`}
                      className={`relative flex w-full items-start gap-3 -mx-1 px-2 py-3.5 text-left rounded-lg transition hover:bg-gray-50 active:bg-gray-100 ${
                        isLast ? "pb-2" : ""
                      }`}
                      onClick={() => openDispatchModal(index)}
                    >
                      <span
                        className="-left-6 absolute top-[1.125rem] bg-gray-900 ring-2 ring-white rounded-full w-3 h-3"
                        aria-hidden
                      />

                      <div className="flex-1 min-w-0 pr-1">
                        <Paragraph1 className="font-semibold text-[10px] text-gray-500 uppercase tracking-[0.18em]">
                          {meta?.kicker ?? ctx.title}
                        </Paragraph1>
                        <Paragraph1 className="mt-1.5 font-semibold text-base text-gray-950 leading-snug tracking-tight">
                          {formatLagosDate(window.start, {
                            includeWeekday: true,
                          })}
                        </Paragraph1>
                        <Paragraph1 className="mt-1 font-medium text-gray-800 text-sm leading-snug">
                          {formatLagosTime(window.start)} –{" "}
                          {formatLagosTime(window.end)}
                        </Paragraph1>
                      </div>

                      <div className="flex shrink-0 items-center gap-0.5 mt-1.5">
                        <Paragraph1 className="font-semibold text-gray-700 text-xs">
                          Edit
                        </Paragraph1>
                        <ChevronRight
                          className="text-gray-500"
                          size={16}
                          aria-hidden
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <Paragraph1 className="mt-3 pt-3 border-gray-100 border-t text-gray-500 text-xs leading-relaxed">
              Address confirmed at checkout.
            </Paragraph1>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isDispatchModalOpen && activeDispatchContext ? (
          <motion.div
            className={`${bottomSheetBackdrop} z-[120] sm:items-center sm:p-4`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsDispatchModalOpen(false)}
          >
            <motion.div
              className={`${bottomSheetPanel} flex max-h-[min(92vh,100%)] w-full max-w-md flex-col px-6 pt-8 sm:max-h-none sm:rounded-2xl sm:pb-8`}
              initial={{ y: 48, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 48, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setIsDispatchModalOpen(false)}
                className="absolute top-4 right-4 rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-black"
                aria-label="Close dispatch modal"
              >
                <X size={20} />
              </button>

              <div className="shrink-0 pr-8">
                <Paragraph1 className="mb-3 font-semibold text-[11px] text-gray-500 uppercase tracking-[0.2em]">
                  Step {dispatchModalStep + 1} of {totalDispatchSteps}
                </Paragraph1>
                <Paragraph3 className="mb-2 font-bold text-black text-xl">
                  {dispatchWindowMeta[activeDispatchContext.type]?.title ??
                    activeDispatchContext.title}
                </Paragraph3>
                <Paragraph1 className="text-base text-gray-600 leading-relaxed">
                  {dispatchWindowMeta[activeDispatchContext.type]?.description ??
                    activeDispatchContext.subtitle}
                </Paragraph1>
              </div>

              <div className="mt-5 h-0.5 w-full shrink-0 bg-gray-100">
                <div
                  className="h-full bg-black transition-all duration-300"
                  style={{ width: `${stepProgress}%` }}
                />
              </div>

              <div className="mt-6 min-h-0 flex-1 overflow-y-auto overscroll-contain">
                <DispatchWindowsScheduler
                  contexts={[activeDispatchContext]}
                  selections={dispatchSelections}
                  onSelectionChange={handleDispatchSelectionChange}
                  embedded
                />
              </div>

              <div className="mt-6 flex shrink-0 gap-3 pt-2">
                <Button
                  text="Back"
                  onClick={() =>
                    setDispatchModalStep((prev) => Math.max(0, prev - 1))
                  }
                  disabled={dispatchModalStep === 0}
                  backgroundColor="bg-white"
                  border="border border-gray-300"
                  color={
                    dispatchModalStep === 0
                      ? "text-gray-300"
                      : "text-gray-700 hover:text-black"
                  }
                  simpleHover
                  additionalClasses="flex-1 !rounded-lg text-base disabled:cursor-not-allowed disabled:opacity-60"
                />
                <Button
                  text={
                    dispatchModalStep < totalDispatchSteps - 1 ? "Next" : "Done"
                  }
                  onClick={() => {
                    if (dispatchModalStep < totalDispatchSteps - 1) {
                      setDispatchModalStep((prev) => prev + 1);
                      return;
                    }
                    setIsDispatchModalOpen(false);
                  }}
                  backgroundColor="bg-black"
                  border="border border-black"
                  color="text-white"
                  simpleHover
                  additionalClasses="flex-1 !rounded-lg text-base"
                />
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

export function rentalDispatchCalendarStartYmd(
  applyDeliveryFloor: boolean,
  closetEarliestDeliveryYmd?: string,
): string {
  let ymd = getSuggestedRentalCalendarStartYmd(DISPATCH_SLOT_MINUTES);
  if (applyDeliveryFloor && closetEarliestDeliveryYmd) {
    ymd = lagosYmdMax(ymd, closetEarliestDeliveryYmd);
  }
  return ymd;
}
