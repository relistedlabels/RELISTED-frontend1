"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import SelectDropdown from "@/common/ui/SelectDropdown";
import { Paragraph1 } from "@/common/ui/Text";
import type {
  DispatchWindowContext,
  DispatchWindowSelection,
  DispatchWindowSelectionMap,
  ShipmentDispatchType,
} from "@/lib/checkout/dispatchWindows";
import {
  buildDispatchWindowChoices,
  dayHasDispatchSlotOnLagosDate,
  deriveDefaultDispatchWindow,
  differenceInDays,
  formatWindowRange,
  getLagosDateString,
} from "@/lib/checkout/dispatchWindows";

interface DispatchWindowsSchedulerProps {
  contexts: DispatchWindowContext[];
  selections: DispatchWindowSelectionMap;
  onSelectionChange?: (
    type: DispatchWindowContext["type"],
    payload: DispatchWindowSelection | undefined,
  ) => void;
  readOnly?: boolean;
  /** Flat layout for use inside a modal (no outer card). */
  embedded?: boolean;
}

type FormState = {
  date: string;
  selectedWindowStart: string;
  errors: string[];
};

type FormMap = Partial<Record<ShipmentDispatchType, FormState>>;

const FIXED_DURATION = 60;

const TYPE_LABELS: Record<ShipmentDispatchType, string> = {
  OUTBOUND: "Rental start",
  RETURN: "Return pickup",
  RESALE: "Delivery options",
};

const WINDOW_LABELS: Record<ShipmentDispatchType, string> = {
  OUTBOUND: "Delivery window",
  RETURN: "Return pickup window",
  RESALE: "Delivery window",
};

const windowsMatch = (
  a: DispatchWindowSelection["window"],
  b: DispatchWindowSelection["window"],
) => a.start === b.start && a.end === b.end;

const resolveChoices = (ctx: DispatchWindowContext, date: string) => {
  const suggestedForDate =
    date === ctx.suggested.scheduledDate
      ? ctx.suggested.window
      : deriveDefaultDispatchWindow(date, {
          durationMinutes: FIXED_DURATION,
        }).window;
  return buildDispatchWindowChoices(date, suggestedForDate, FIXED_DURATION);
};

const pickChoiceForWindow = (
  ctx: DispatchWindowContext,
  window: DispatchWindowSelection["window"],
) => {
  const choices = resolveChoices(ctx, getLagosDateString(window.start));
  return (
    choices.find((choice) => windowsMatch(choice.window, window)) ?? choices[0]
  );
};

const buildFormState = (
  ctx: DispatchWindowContext,
  selection?: DispatchWindowSelection,
): FormState => {
  const window = selection?.window ?? ctx.suggested.window;
  const date = getLagosDateString(window.start);
  const choice = pickChoiceForWindow(ctx, window);
  return {
    date,
    selectedWindowStart: choice?.value ?? window.start,
    errors: [],
  };
};

export default function DispatchWindowsScheduler({
  contexts,
  selections,
  onSelectionChange,
  readOnly = false,
  embedded = false,
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
    const readOnlyFallbackLabel = (type: ShipmentDispatchType) =>
      type === "RETURN" ? "Return pickup" : "Delivery";

    return (
      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
        <div className="space-y-3">
          {contexts.map((ctx) => {
            const windowToShow =
              selections?.[ctx.type]?.window ??
              ctx.lockedWindow ??
              ctx.suggested.window;
            const hasWindow =
              windowToShow &&
              typeof windowToShow.start === "string" &&
              typeof windowToShow.end === "string" &&
              windowToShow.start.length > 0 &&
              windowToShow.end.length > 0;
            const heading =
              ctx.title?.trim() || readOnlyFallbackLabel(ctx.type);
            return (
              <div key={ctx.type}>
                <Paragraph1 className="font-semibold text-[11px] text-gray-400 uppercase tracking-[0.2em]">
                  {heading}
                </Paragraph1>
                {hasWindow ? (
                  <Paragraph1 className="font-semibold text-gray-900 text-sm">
                    {formatWindowRange(windowToShow)}
                  </Paragraph1>
                ) : (
                  <Paragraph1 className="text-gray-500 text-sm">
                    Delivery time is not on file yet. Refresh the page, or open
                    the product page and confirm delivery options again.
                  </Paragraph1>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const applyWindow = (
    ctx: DispatchWindowContext,
    window: DispatchWindowSelection["window"],
    form: FormState,
  ) => {
    const isDefault = windowsMatch(window, ctx.suggested.window);

    setForms((prev) => ({
      ...prev,
      [ctx.type]: {
        ...(prev[ctx.type] ?? form),
        ...form,
        selectedWindowStart: window.start,
        errors: [],
      },
    }));

    safeOnSelectionChange(ctx.type, {
      type: ctx.type,
      window: isDefault ? ctx.suggested.window : window,
      mode: isDefault ? "DEFAULT" : "CUSTOM",
      baseDate: ctx.suggested.baseDate,
      scheduledDate: getLagosDateString(window.start),
      rolledForwardDays: differenceInDays(
        ctx.suggested.baseDate,
        getLagosDateString(window.start),
      ),
    });
  };

  const handleDateChange = (ctx: DispatchWindowContext, date: string) => {
    const current = forms[ctx.type];
    if (!current) return;

    if (!dayHasDispatchSlotOnLagosDate(date, FIXED_DURATION)) {
      setForms((prev) => ({
        ...prev,
        [ctx.type]: {
          ...current,
          date,
          selectedWindowStart: "",
          errors: [
            "No dispatch windows remain on this date. Choose the next day or later.",
          ],
        },
      }));
      return;
    }

    const choices = resolveChoices(ctx, date);
    const nextChoice = choices[0];
    if (!nextChoice) return;

    applyWindow(ctx, nextChoice.window, {
      ...current,
      date,
      selectedWindowStart: nextChoice.value,
      errors: [],
    });
  };

  const handleWindowChange = (
    ctx: DispatchWindowContext,
    selectedWindowStart: string,
  ) => {
    const current = forms[ctx.type];
    if (!current) return;
    const choices = resolveChoices(ctx, current.date);
    const choice = choices.find((item) => item.value === selectedWindowStart);
    if (!choice) return;

    applyWindow(ctx, choice.window, {
      ...current,
      selectedWindowStart: choice.value,
      errors: [],
    });
  };

  const renderWindowPicker = (ctx: DispatchWindowContext, form: FormState) => {
    const choices = resolveChoices(ctx, form.date);
    const slotOptionsList = choices.map((choice) => ({
      value: choice.value,
      label: choice.label,
    }));
    const activeSelection = selections?.[ctx.type];

    return (
      <div className="mt-3 space-y-2">
        <Paragraph1 className="font-medium text-gray-900 text-sm">
          {WINDOW_LABELS[ctx.type]}
        </Paragraph1>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {ctx.allowDateChange ? (
            <input
              type="date"
              value={form.date}
              min={ctx.minDate}
              onChange={(e) => handleDateChange(ctx, e.target.value)}
              aria-label="Delivery date"
              className="w-full shrink-0 rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black sm:w-auto"
            />
          ) : null}

          <SelectDropdown
            value={form.selectedWindowStart}
            options={slotOptionsList}
            onChange={(nextValue) => handleWindowChange(ctx, nextValue)}
            ariaLabel={WINDOW_LABELS[ctx.type]}
            placeholder="Choose a delivery window"
            emptyMessage="No windows left on this date. Pick another day."
            className="flex-1"
          />
        </div>

        {form.errors.length > 0 && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700 text-sm">
            {form.errors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        )}

        {ctx.suggested.rolledForwardDays > 0 &&
        activeSelection?.mode === "DEFAULT" ? (
          <div className="flex items-center gap-1 text-amber-600">
            <AlertTriangle size={12} />
            <Paragraph1 className="text-xs">
              Shifted +{ctx.suggested.rolledForwardDays}d to fit dispatch hours
            </Paragraph1>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {contexts.map((ctx) => {
        const form = forms[ctx.type];
        if (!form) return null;
        const content = (
          <>
            <div className="flex items-start justify-between gap-3">
              <Paragraph1 className="font-semibold text-[11px] text-gray-500 uppercase tracking-[0.2em]">
                {TYPE_LABELS[ctx.type]}
              </Paragraph1>
              {ctx.baseDateLabel ? (
                <Paragraph1 className="shrink-0 font-semibold text-gray-900 text-sm">
                  {ctx.baseDateLabel}
                </Paragraph1>
              ) : null}
            </div>

            {renderWindowPicker(ctx, form)}
          </>
        );

        if (embedded) {
          return (
            <div key={ctx.type} className="space-y-0">
              {content}
            </div>
          );
        }

        return (
          <div
            key={ctx.type}
            className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
          >
            {content}
          </div>
        );
      })}
    </div>
  );
}
