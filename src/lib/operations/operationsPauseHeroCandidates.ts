/** Lifestyle assets to compare for the break announcement modal. */
export const OPERATIONS_PAUSE_HERO_CANDIDATES = [
  { src: "/videos/hero1-poster.jpg", label: "hero1-poster.jpg" },
  { src: "/images/cro1.jpg", label: "cro1.jpg" },
  { src: "/images/cro2.jpg", label: "cro2.jpg" },
  { src: "/images/cro3.jpg", label: "cro3.jpg" },
  { src: "/images/cro4.jpg", label: "cro4.jpg" },
  { src: "/images/herobg.jpg", label: "herobg.jpg" },
  { src: "/images/shoph.jpg", label: "shoph.jpg" },
  { src: "/images/womansec.jpg", label: "womansec.jpg" },
  { src: "/images/abbouthero.png", label: "abbouthero.png" },
  { src: "/images/mis2.jpg", label: "mis2.jpg" },
  { src: "/images/mis3.jpg", label: "mis3.jpg" },
  { src: "/images/dr2.jpg", label: "dr2.jpg" },
  { src: "/images/vi33.jpg", label: "vi33.jpg" },
  { src: "/images/expolbg.jpg", label: "expolbg.jpg" },
  { src: "/category/c3.jpg", label: "category/c3.jpg" },
] as const;

export function isOperationsPauseHeroPreviewEnabled(
  searchParams: URLSearchParams | null,
): boolean {
  return searchParams?.get("pauseHeroPreview") === "1";
}
