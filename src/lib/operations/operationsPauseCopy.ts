import type { OperationsPauseState } from "./operationsPause";
import { pauseClosedFromLabel, pauseResumeLabel } from "./operationsPause";

/** User-facing strings for the holiday operations pause. */
export const operationsPauseCopy = {
  banner: {
    lead: () => "Closed for the holidays:",
    body: (pause: OperationsPauseState) =>
      ` Rentals and purchases pause from ${pauseClosedFromLabel(pause)} until ${pauseResumeLabel(pause)}. Browse, save favorites, and list anytime.`,
    readUpdate: "Read update",
  },
  modal: {
    eyebrow: "An important update from Relisted Labels",
    headline: "Closed for the holidays",
    paragraphs: (pause: OperationsPauseState) => [
      "Thank you for being part of our community this year. After a full year together, we are taking a holiday break.",
      `Rentals and purchases pause from ${pauseClosedFromLabel(pause)} through ${pauseResumeLabel(pause)}. You can still explore the shop, save favorites, and list from your wardrobe.`,
    ],
    signOff: "Happy holidays. See you in the new year.",
    team: ["With love,", "the Relisted Labels team"] as const,
    continue: "Continue browsing",
    scrollHint: "Keep browsing after you continue",
  },
  checkout: {
    headline: "Closed for the holidays",
    body: (pause: OperationsPauseState) =>
      `Rentals and checkout are paused until we reopen in ${pause.resumeLabel}. You can still browse, save favorites, and list pieces.`,
    cta: "Back to shop",
  },
  toast: {
    title: "Closed for the holidays",
    body: (pause: OperationsPauseState) =>
      `Rentals and purchases are paused until ${pause.resumeLabel}. Browsing, favorites, and listing still work.`,
  },
  ctaPaused: (pause: OperationsPauseState) =>
    `Reopens ${pause.resumeLabel}`,
};
