"use client";

import HowItWorks from "@/app/home/sections/HowItWorks";
import TopListingSection1 from "@/app/home/sections/TopListingSection1";
import TopListingSection2 from "@/app/home/sections/TopListingSection2";
import TopListingSection3 from "@/app/home/sections/TopListingSection3";

/** Vacation outfits, How it works, vault closet strip, then black tie (after categories). */
export default function HomeMidSections() {
  return (
    <>
      <br />
      <TopListingSection2 />
      <HowItWorks />
      <TopListingSection3 />
      <TopListingSection1 />
    </>
  );
}
