import { toast } from "sonner";
import { operationsPauseCopy } from "./operationsPauseCopy";

export type OperationsPauseState = {
  active: boolean;
  resumeLabel: string;
  closedFromLabel: string;
};

/** Shape from public site-features API or env (fields optional). */
export type OperationsPauseRaw = {
  active?: boolean;
  resumeLabel?: string;
  closedFromLabel?: string;
  closedFrom?: string;
};

export const DEFAULT_OPERATIONS_PAUSE_RESUME_LABEL = "January 2027";
export const DEFAULT_OPERATIONS_PAUSE_CLOSED_FROM = "November 5";

export const OPERATIONS_PAUSE_DISMISS_STORAGE_KEY =
  "relisted-operations-pause-announcement-v3";

export const OPERATIONS_PAUSE_HERO_SRC = "/images/mis2.jpg";

/** Query flag: `?pauseHeroPreview=1` opens the modal and cycles hero options. */
export const OPERATIONS_PAUSE_HERO_PREVIEW_PARAM = "pauseHeroPreview";

function closedFromFromRaw(raw: unknown): string {
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  return DEFAULT_OPERATIONS_PAUSE_CLOSED_FROM;
}

export function pauseClosedFromLabel(pause: OperationsPauseState): string {
  return pause.closedFromLabel?.trim() || DEFAULT_OPERATIONS_PAUSE_CLOSED_FROM;
}

export function pauseResumeLabel(pause: OperationsPauseState): string {
  return pause.resumeLabel?.trim() || DEFAULT_OPERATIONS_PAUSE_RESUME_LABEL;
}

export function normalizeOperationsPause(
  raw: OperationsPauseRaw | undefined | null,
): OperationsPauseState {
  const resumeLabel =
    raw?.resumeLabel?.trim() || DEFAULT_OPERATIONS_PAUSE_RESUME_LABEL;
  const closedFromLabel = closedFromFromRaw(
    raw?.closedFromLabel ??
      (raw as { closedFrom?: string } | undefined)?.closedFrom,
  );

  if (!raw?.active) {
    return { active: false, resumeLabel, closedFromLabel };
  }
  return { active: true, resumeLabel, closedFromLabel };
}

export function operationsPauseFromEnv(): OperationsPauseState | null {
  const flag = process.env.NEXT_PUBLIC_OPERATIONS_PAUSE?.trim().toLowerCase();
  if (flag !== "true" && flag !== "1" && flag !== "yes") return null;
  const resumeLabel =
    process.env.NEXT_PUBLIC_OPERATIONS_PAUSE_RESUME_LABEL?.trim() ||
    DEFAULT_OPERATIONS_PAUSE_RESUME_LABEL;
  const closedFromLabel =
    process.env.NEXT_PUBLIC_OPERATIONS_PAUSE_CLOSED_FROM?.trim() ||
    DEFAULT_OPERATIONS_PAUSE_CLOSED_FROM;
  return {
    active: true,
    resumeLabel,
    closedFromLabel,
  };
}

export function operationsPauseTransactionMessage(
  pause: OperationsPauseState,
): string {
  return operationsPauseCopy.toast.body(pause);
}

export function notifyOperationsPauseBlocked(pause: OperationsPauseState): void {
  toast.message(operationsPauseCopy.toast.title, {
    description: operationsPauseTransactionMessage(pause),
  });
}

export function isOperationsPauseAnnouncementDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return (
      window.sessionStorage.getItem(OPERATIONS_PAUSE_DISMISS_STORAGE_KEY) ===
      "1"
    );
  } catch {
    return false;
  }
}

export function dismissOperationsPauseAnnouncement(): void {
  try {
    window.sessionStorage.setItem(OPERATIONS_PAUSE_DISMISS_STORAGE_KEY, "1");
  } catch {
    /* ignore */
  }
}
