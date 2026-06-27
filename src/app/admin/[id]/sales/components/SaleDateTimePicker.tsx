"use client";

import { Calendar, ChevronDown } from "lucide-react";
import { useMemo } from "react";
import {
  formatHourMinuteLabel,
  joinDatetimeLocal,
  splitDatetimeLocal,
} from "../lib/saleDateTime";
import { saleDateTimeWrapClass } from "../lib/saleFormStyles";

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, "0"),
);

type Props = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  minDate?: string;
  disabled?: boolean;
  className?: string;
};

function TimeSelect({
  value,
  onChange,
  options,
  disabled,
  ariaLabel,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
  ariaLabel: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className ?? ""}`}>
      <select
        value={value}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none w-full bg-transparent py-2.5 pl-2 pr-7 text-sm text-gray-900 focus:outline-none disabled:cursor-not-allowed disabled:text-gray-400 cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
        aria-hidden
      />
    </div>
  );
}

export default function SaleDateTimePicker({
  id,
  value,
  onChange,
  minDate,
  disabled,
  className = saleDateTimeWrapClass,
}: Props) {
  const parts = useMemo(() => splitDatetimeLocal(value), [value]);
  const date = parts?.date ?? "";
  const hour = parts?.hour ?? "10";
  const minute = parts?.minute ?? "00";

  const hourOptions = useMemo(
    () =>
      HOURS.map((h) => ({
        value: h,
        label: formatHourMinuteLabel(h, minute),
      })),
    [minute],
  );

  const minuteOptions = useMemo(
    () => MINUTES.map((m) => ({ value: m, label: m })),
    [],
  );

  const update = (next: Partial<{ date: string; hour: string; minute: string }>) => {
    const merged = {
      date: next.date ?? date,
      hour: next.hour ?? hour,
      minute: next.minute ?? minute,
    };
    if (!merged.date) {
      onChange("");
      return;
    }
    onChange(joinDatetimeLocal(merged));
  };

  return (
    <div
      className={`${className} mt-1.5 flex items-stretch rounded-lg border border-gray-300 bg-white overflow-hidden transition-shadow focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-gray-900/10 ${
        disabled ? "opacity-60" : ""
      }`}
    >
      <label
        htmlFor={id}
        className="flex min-w-0 flex-1 items-center gap-2 px-3 border-r border-gray-200 cursor-pointer"
      >
        <Calendar className="w-4 h-4 shrink-0 text-gray-400" aria-hidden />
        <input
          id={id}
          type="date"
          value={date}
          min={minDate}
          disabled={disabled}
          onChange={(e) => update({ date: e.target.value })}
          className="min-w-0 flex-1 border-0 bg-transparent py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-0 disabled:cursor-not-allowed [color-scheme:light]"
        />
      </label>

      <div className="flex items-center shrink-0 bg-gray-50/80">
        <TimeSelect
          value={hour}
          disabled={disabled || !date}
          ariaLabel="Time"
          onChange={(h) => update({ hour: h })}
          options={hourOptions}
          className="min-w-[6.75rem]"
        />
        <span className="text-gray-300 text-sm select-none" aria-hidden>
          :
        </span>
        <TimeSelect
          value={minute}
          disabled={disabled || !date}
          ariaLabel="Minutes"
          onChange={(m) => update({ minute: m })}
          options={minuteOptions}
          className="min-w-[3.25rem]"
        />
      </div>
    </div>
  );
}
