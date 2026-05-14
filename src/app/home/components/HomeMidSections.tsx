"use client";

import HowItWorks from "@/app/home/sections/HowItWorks";
import TopListingSection1 from "@/app/home/sections/TopListingSection1";
import TopListingSection2 from "@/app/home/sections/TopListingSection2";
import TopListingSection3 from "@/app/home/sections/TopListingSection3";

/** Top listings block 3, then How it works (render before categories from the home page). */
export function HomeBeforeCategorySections() {
  return (
    <>
      <br />
      <TopListingSection3 />
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
