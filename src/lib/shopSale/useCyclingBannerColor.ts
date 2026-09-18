"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  BANNER_COLOR_PRESETS,
  DEFAULT_BANNER_COLOR_PRESET,
  type BannerColorPreset,
} from "./bannerColorPresets";

const CYCLE_MS = 10_000;
const QUERY_FLAG = "bannerColorCycle";

export function isBannerColorCycleEnabled(
  searchParams: Pick<URLSearchParams, "get"> | null,
): boolean {
  return searchParams?.get(QUERY_FLAG) === "1";
}

/**
 * Cycles through BANNER_COLOR_PRESETS every 10s when ?bannerColorCycle=1 is in the URL.
 * Otherwise returns the default white preset.
 */
export function useCyclingBannerColor(): {
  preset: BannerColorPreset;
  cycling: boolean;
  presetIndex: number;
} {
  const searchParams = useSearchParams();
  const cycling = isBannerColorCycleEnabled(searchParams);
  const [presetIndex, setPresetIndex] = useState(0);

  useEffect(() => {
    if (!cycling) {
      setPresetIndex(0);
      return;
    }

    const id = setInterval(() => {
      setPresetIndex((i) => (i + 1) % BANNER_COLOR_PRESETS.length);
    }, CYCLE_MS);

    return () => clearInterval(id);
  }, [cycling]);

  const preset = cycling
    ? BANNER_COLOR_PRESETS[presetIndex]!
    : DEFAULT_BANNER_COLOR_PRESET;

  return { preset, cycling, presetIndex };
}
