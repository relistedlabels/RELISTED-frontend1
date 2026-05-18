"use client";

import HowItWorks from "@/app/home/sections/HowItWorks";
import TopListingSection1 from "@/app/home/sections/TopListingSection1";
import TopListingSection2 from "@/app/home/sections/TopListingSection2";
/** How it works (render before categories from the home page). */
export function HomeBeforeCategorySections() {
  return (
    <>
      <br />
      <HowItWorks />
    </>
  );
}

/** Vacation outfits, then black tie (after categories on the home page). */
export default function HomeMidSections() {
  return (
    <>
      <TopListingSection2 />
      <TopListingSection1 />
    </>
  );
}
