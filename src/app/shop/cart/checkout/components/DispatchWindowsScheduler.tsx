"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Zap } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import type {
  DerivedDispatchWindow,
  DispatchWindowContext,
  DispatchWindowSelection,
  DispatchWindowSelectionMap,
  ShipmentDispatchType,
} from "@/lib/checkout/dispatchWindows";
import {
  buildDispatchWindowFromForm,
  dayHasDispatchSlotOnLagosDate,
  differenceInDays,
  formatLagosDate,
  formatLagosTime,
  formatWindowRange,
  getLagosDateString,
  getLagosDateTimeParts,
  isDispatchSlotStartValidOnLagosDate,
  isImmediateDispatch,
  parseTimeToMinutes,
  DISPATCH_WINDOW_START_HOUR,
  DISPATCH_WINDOW_END_HOUR,
} from "@/lib/checkout/dispatchWindows";

interface DispatchWindowsSchedulerProps {
  contexts: DispatchWindowContext[];
  selections: DispatchWindowSelectionMap;
  onSelectionChange?: (
    type: DispatchWindowContext["type"],
    payload: DispatchWindowSelection | undefined,
  ) => void;
  readOnly?: boolean;
}

type FormState = {
  mode: "DEFAULT" | "CUSTOM";
  date: string;
  startTime: string;
  errors: string[];
};

type FormMap = Partial<Record<ShipmentDispatchType, FormState>>;

const FIXED_DURATION = 60;
const START_MINUTES = DISPATCH_WINDOW_START_HOUR * 60;
const LAST_START_MINUTES = DISPATCH_WINDOW_END_HOUR * 60 - FIXED_DURATION;

const TYPE_LABELS: Record<ShipmentDispatchType, string> = {
  OUTBOUND: "Rental start",
  RETURN: "Return pickup",
  RESALE: "Delivery window",
};

const slotOptions = Array.from({
  length: Math.floor((LAST_START_MINUTES - START_MINUTES) / FIXED_DURATION) + 1,
}).map((_, idx) => START_MINUTES + idx * FIXED_DURATION);

const toTime = (minutes: number) => {
  const hrs = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const mins = (minutes % 60).toString().padStart(2, "0");
  return `${hrs}:${mins}`;
};

const buildFormState = (
  ctx: DispatchWindowContext,
  selection?: DispatchWindowSelection,
): FormState => {
  const window = selection?.window ?? ctx.suggested.window;
  const startParts = getLagosDateTimeParts(window.start);
  const startMinutes = startParts.hour * 60 + startParts.minute;
  const snappedStart = Math.min(
    Math.max(startMinutes - (startMinutes % FIXED_DURATION), START_MINUTES),
    LAST_START_MINUTES,
  );
  return {
    mode: selection?.mode ?? "DEFAULT",
    date:
      selection?.mode === "CUSTOM"
        ? getLagosDateString(window.start)
        : ctx.suggested.scheduledDate,
    startTime: toTime(snappedStart),
    errors: [],
  };
};

export default function DispatchWindowsScheduler({
  contexts,
  selections,
  onSelectionChange,
  readOnly = false,
}: DispatchWindowsSchedulerProps) {
  const [forms, setForms] = useState<FormMap>({});
  const safeOnSelectionChange = onSelectionChange ?? (() => {});

  useEffect(() => {
    if (contexts.length === 0) {
      setForms({});
      return;
    }
    const next: FormMap = {};
    contexts.forEach((ctx) => {
      next[ctx.type] = buildFormState(ctx, selections?.[ctx.type]);
    });
    setForms(next);
  }, [contexts, selections]);

  if (contexts.length === 0) return null;

  if (readOnly) {
    const outboundCtx = contexts.find((c) => c.type === "OUTBOUND");
    const returnCtx = contexts.find((c) => c.type === "RETURN");

    return (
      <div className="bg-gray-50 p-3 border border-gray-200 rounded-lg">
        <div className="space-y-3">
          {outboundCtx && (
            <div>
              <Paragraph1 className="font-semibold text-[11px] text-gray-400 uppercase tracking-[0.2em]">
                Delivery
              </Paragraph1>
              <Paragraph1 className="font-semibold text-gray-900 text-sm">
                {formatWindowRange(outboundCtx.suggested.window)}
              </Paragraph1>
            </div>
          )}
          {returnCtx && (
            <div>
              <Paragraph1 className="font-semibold text-[11px] text-gray-400 uppercase tracking-[0.2em]">
                Return pickup
              </Paragraph1>
              <Paragraph1 className="font-semibold text-gray-900 text-sm">
                {formatWindowRange(returnCtx.suggested.window)}
              </Paragraph1>
            </div>
          )}
        </div>
      </div>
    );
  }

  const handleModeChange = (
    ctx: DispatchWindowContext,
    mode: "DEFAULT" | "CUSTOM",
  ) => {
    const current =
      forms[ctx.type] ?? buildFormState(ctx, selections?.[ctx.type]);
    const nextState: FormState =
      mode === "DEFAULT"
        ? {
            ...current,
            mode: "DEFAULT",
            date: ctx.suggested.scheduledDate,
            errors: [],
          }
        : {
            ...current,
            mode: "CUSTOM",
            date: ctx.allowDateChange
              ? current.date
              : ctx.suggested.scheduledDate,
            errors: [],
          };
    setForms((prev) => ({ ...prev, [ctx.type]: nextState }));

    if (mode === "DEFAULT") {
      safeOnSelectionChange(ctx.type, {
        type: ctx.type,
        window: ctx.suggested.window,
        mode: "DEFAULT",
        baseDate: ctx.suggested.baseDate,
        scheduledDate: ctx.suggested.scheduledDate,
        rolledForwardDays: ctx.suggested.rolledForwardDays,
      });
      return;
    }

    applyCustomSelection(ctx, nextState);
  };

  const applyCustomSelection = (
    ctx: DispatchWindowContext,
    form: FormState,
  ) => {
    const result = buildDispatchWindowFromForm({
      date: form.date,
      startTime: form.startTime,
      durationMinutes: FIXED_DURATION,
    });

    setForms((prev) => ({
      ...prev,
      [ctx.type]: {
        ...(prev[ctx.type] ?? form),
        ...form,
        errors: result.errors,
      },
    }));

    if (!result.window || result.errors.length > 0) return;

    safeOnSelectionChange(ctx.type, {
      type: ctx.type,
      window: result.window,
      mode: "CUSTOM",
      baseDate: ctx.suggested.baseDate,
      scheduledDate: getLagosDateString(result.window.start),
      rolledForwardDays: differenceInDays(
        ctx.suggested.baseDate,
        getLagosDateString(result.window.start),
      ),
    });
  };

  const handleFieldChange = (
    ctx: DispatchWindowContext,
    field: keyof Pick<FormState, "date" | "startTime">,
    value: string,
  ) => {
    const current = forms[ctx.type];
    if (!current) return;
    let nextState: FormState = {
      ...current,
      [field]: value,
      errors: [],
    };

    if (field === "date" && nextState.mode === "CUSTOM") {
      if (!dayHasDispatchSlotOnLagosDate(value, FIXED_DURATION)) {
        nextState = {
          ...nextState,
          startTime: "",
          errors: [
            "No dispatch windows remain on this date. Choose the next day or later.",
          ],
        };
      } else {
        const first = slotOptions.find((sm) =>
          isDispatchSlotStartValidOnLagosDate(value, sm, FIXED_DURATION),
        );
        const curMin = parseTimeToMinutes(nextState.startTime);
        const currentStillValid =
          curMin !== null &&
          slotOptions.some(
            (sm) =>
              sm === curMin &&
              isDispatchSlotStartValidOnLagosDate(value, sm, FIXED_DURATION),
          );
        if (!currentStillValid && first !== undefined) {
          nextState = { ...nextState, startTime: toTime(first) };
        }
      }
    }

    setForms((prev) => ({ ...prev, [ctx.type]: nextState }));
    if (nextState.mode === "CUSTOM") {
      applyCustomSelection(ctx, nextState);
    }
  };

  const renderActiveSummary = (
    ctx: DispatchWindowContext,
    selection?: DispatchWindowSelection,
  ) => {
    if (!selection) return null;
    const immediate = isImmediateDispatch(selection.window.start);
    return (
      <div className="flex justify-between items-center gap-3 bg-gray-50 mt-3 px-3 py-2 border border-gray-200 rounded-lg">
        <div>
          <Paragraph1 className="font-semibold text-gray-900 text-sm">
            {formatWindowRange(selection.window)}
          </Paragraph1>
        </div>
        {immediate && (
          <div className="flex items-center gap-1 text-amber-600">
            <Zap size={13} />
            <Paragraph1 className="font-semibold text-xs">Immediate</Paragraph1>
          </div>
        )}
      </div>
    );
  };

  const renderDefaultView = (ctx: DispatchWindowContext, form: FormState) => (
    <div className="bg-gray-50 mt-3 px-3 py-2 border border-gray-200 rounded-lg">
      <Paragraph1 className="font-semibold text-gray-900 text-sm">
        {ctx.defaultSummary || formatWindowRange(ctx.suggested.window)}
      </Paragraph1>
      {ctx.suggested.rolledForwardDays > 0 && (
        <div className="flex items-center gap-1 mt-1 text-amber-600">
          <AlertTriangle size={12} />
          <Paragraph1 className="text-xs">
            Shifted +{ctx.suggested.rolledForwardDays}d to fit dispatch hours
          </Paragraph1>
        </div>
      )}
    </div>
  );

  const renderCustomForm = (ctx: DispatchWindowContext, form: FormState) => {
    return (
      <div className="space-y-3 mt-3">
        {ctx.allowDateChange && (
          <div>
            <Paragraph1 className="mb-2 font-semibold text-[11px] text-gray-500 uppercase tracking-[0.15em]">
              Date
            </Paragraph1>
            <input
              type="date"
              value={form.date}
              min={ctx.minDate}
              onChange={(e) => handleFieldChange(ctx, "date", e.target.value)}
              className="px-3 py-[7px] border border-gray-300 focus:border-gray-900 rounded-[4px] focus:outline-none w-full text-[13px]"
            />
          </div>
        )}

        <div>
          <Paragraph1 className="mt-8 mb-2 font-semibold text-[11px] text-gray-500 uppercase tracking-[0.15em]">
            Choose a 1-hour arrival window
          </Paragraph1>
          <div className="gap-2 grid grid-cols-3">
            {slotOptions
              .filter((startMin) =>
                isDispatchSlotStartValidOnLagosDate(
                  form.date,
                  startMin,
                  FIXED_DURATION,
                ),
              )
              .map((startMin) => {
                const endMin = startMin + 60;
                const slotKey = toTime(startMin);
                const label = `${formatLagosTime(`${form.date}T${toTime(startMin)}:00+01:00`)}–${formatLagosTime(`${form.date}T${toTime(endMin)}:00+01:00`)}`;
                const isSelected = form.startTime === slotKey;
                return (
                  <button
                    key={slotKey}
                    type="button"
                    onClick={() => handleFieldChange(ctx, "startTime", slotKey)}
                    className={`rounded-[4px] border px-2 py-[7px] text-[12px] font-semibold transition-colors ${
                      isSelected
                        ? "border-black bg-black text-white"
                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-900"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            {slotOptions.every(
              (startMin) =>
                !isDispatchSlotStartValidOnLagosDate(
                  form.date,
                  startMin,
                  FIXED_DURATION,
                ),
            ) && (
              <Paragraph1 className="col-span-3 text-[12px] text-gray-500">
                No pickup windows left on this date. Move to the next day or
                switch back to default.
              </Paragraph1>
            )}
          </div>
        </div>

        {form.errors.length > 0 && (
          <div className="bg-red-50 px-3 py-2 border border-red-200 rounded-[4px] text-[13px] text-red-700">
            {form.errors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="space-y-4">
        {contexts.map((ctx) => {
          const form = forms[ctx.type];
          if (!form) return null;
          const activeSelection = selections?.[ctx.type];
          return (
            <div
              key={ctx.type}
              className="bg-white p-4 border border-gray-200 rounded-xl"
            >
              <div className="flex justify-between items-start gap-3">
                <div>
                  <Paragraph1 className="font-semibold text-[11px] text-gray-400 uppercase tracking-[0.2em]">
                    {TYPE_LABELS[ctx.type]}
                  </Paragraph1>
                </div>
                {ctx.baseDateLabel && (
                  <div className="text-right shrink-0">
                    <Paragraph1 className="font-semibold text-gray-900 text-sm">
                      {ctx.baseDateLabel}
                    </Paragraph1>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => handleModeChange(ctx, "DEFAULT")}
                  className={`relative overflow-hidden rounded-[4px] border px-[17px] py-[7px] text-[13px] font-semibold transition-colors ${
                    form.mode === "DEFAULT"
                      ? "border-black bg-black text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-900"
                  }`}
                >
                  Default window
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange(ctx, "CUSTOM")}
                  className={`relative overflow-hidden rounded-[4px] border px-[17px] py-[7px] text-[13px] font-semibold transition-colors ${
                    form.mode === "CUSTOM"
                      ? "border-black bg-black text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-900"
                  }`}
                >
                  Custom window
                </button>
              </div>

              {form.mode !== "DEFAULT" && renderCustomForm(ctx, form)}

              {renderActiveSummary(ctx, activeSelection)}
            </div>
          );
        })}
      </div>
    </div>
  );
}