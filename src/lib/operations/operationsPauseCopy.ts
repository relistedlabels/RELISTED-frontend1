import type { OperationsPauseState } from "./operationsPause";
import { pauseClosedFromLabel, pauseResumeLabel } from "./operationsPause";

/** User-facing strings for the holiday operations pause. */
export const operationsPauseCopy = {
  banner: {
    lead: () => "Closed for the holidays:",
    body: (pause: OperationsPauseState) =>
      ` Rentals and purchases pause from ${pauseClosedFromLabel(pause)} until ${pauseResumeLabel(pause)}. Browse and list anytime.`,
    readUpdate: "Read update",
  },
  modal: {
    eyebrow: "An important update from Relisted Labels",
    headline: "Closed for the holidays",
    paragraphs: (pause: OperationsPauseState) => [
      "After a full year with our community, we are taking a holiday break.",
      `Rentals and purchases pause from ${pauseClosedFromLabel(pause)} through ${pauseResumeLabel(pause)}. You can still explore the shop and list from your wardrobe.`,
    ],
    signOff: "Happy holidays. See you in the new year.",
    team: ["With love,", "the Relisted Labels team"] as const,
    continue: "Continue browsing",
    scrollHint: "Keep browsing after you continue",
  },
  checkout: {
    headline: "Closed for the holidays",
    body: (pause: OperationsPauseState) =>
      `Rentals and checkout are paused until we reopen in ${pause.resumeLabel}. You can still browse the shop and list pieces.`,
    cta: "Back to shop",
  },
  toast: {
    title: "Closed for the holidays",
    body: (pause: OperationsPauseState) =>
      `Rentals and purchases are paused until ${pause.resumeLabel}. Browsing and listing still work.`,
  },
  ctaPaused: (pause: OperationsPauseState) =>
    `Reopens ${pause.resumeLabel}`,
};
