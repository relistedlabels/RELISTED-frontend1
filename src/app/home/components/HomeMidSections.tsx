"use client";

import HowItWorks from "@/app/home/sections/HowItWorks";
import TopListingSection1 from "@/app/home/sections/TopListingSection1";
import TopListingSection2 from "@/app/home/sections/TopListingSection2";

/** Vacation outfits, How it works, then black tie (after categories). */
export default function HomeMidSections() {
  return (
    <>
      <br />
      <TopListingSection2 />
      <HowItWorks />
      <TopListingSection1 />
    </>
  );
}
