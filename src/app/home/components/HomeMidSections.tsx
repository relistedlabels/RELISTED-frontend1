"use client";

import HowItWorks from "@/app/home/sections/HowItWorks";
import TopListingSection1 from "@/app/home/sections/TopListingSection1";
import TopListingSection2 from "@/app/home/sections/TopListingSection2";
import TopListingSection3 from "@/app/home/sections/TopListingSection3";
import { usePublicSiteFeatures } from "@/lib/queries/site/useSiteFeatures";

/**
 * When the public header Closets feature is on, only the Vacation and Vault Closet
 * strips swap places; How it works stays between them.
 */
export default function HomeMidSections() {
  const { data } = usePublicSiteFeatures();
  const closetHeaderFeatureOn =
    data?.data?.headerClosetsShopNavEnabled !== false;

  if (closetHeaderFeatureOn) {
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
