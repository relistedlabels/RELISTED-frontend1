"use client";

import HowItWorks from "@/app/home/sections/HowItWorks";
import TopListingSection1 from "@/app/home/sections/TopListingSection1";
import TopListingSection2 from "@/app/home/sections/TopListingSection2";
import TopListingSection3 from "@/app/home/sections/TopListingSection3";

/** Vacation outfits, then How it works, then vault closet strip, then black tie. */
export default function HomeMidSections() {
  return (
    <>
      <br />
      <TopListingSection3 />
      <HowItWorks />
      <TopListingSection2 />
      <TopListingSection1 />
    </>
  );
}
