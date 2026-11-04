// ENDPOINTS: GET /api/public/users, GET /api/public/categories, GET /tags

import React from "react";
import StyleSpotlightHero from "./sections/StyleSpotlightHero";
import StyleCategoriesSection from "./sections/StyleCategoriesSection";
import TagsGridSection from "./sections/TagsGridSection";
import MeetCuratorsSection from "./sections/MeetCuratorsSection";
import BecomeCuratorSection from "./sections/BecomeCuratorSection";
import { SITE_FIXED_HEADER_PT } from "@/lib/layout/siteNavOffset";

export default function StyleSpotlightPage() {
  return (
    <div className={SITE_FIXED_HEADER_PT}>
      {/* <StyleSpotlightHero /> */}
      {/* <MeetCuratorsSection /> */}
      <StyleCategoriesSection />
      <TagsGridSection />
      <BecomeCuratorSection />
    </div>
  );
}
