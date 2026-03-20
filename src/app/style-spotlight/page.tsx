// ENDPOINTS: GET /api/public/users, GET /api/public/categories, GET /tags

import React from "react";
import StyleSpotlightHero from "./sections/StyleSpotlightHero";
import StyleCategoriesSection from "./sections/StyleCategoriesSection";
import TagsGridSection from "./sections/TagsGridSection";
import MeetCuratorsSection from "./sections/MeetCuratorsSection";
import BecomeCuratorSection from "./sections/BecomeCuratorSection";

export default function StyleSpotlightPage() {
  return (
    <div>
      <StyleSpotlightHero />
      {/* <MeetCuratorsSection /> */}
      <StyleCategoriesSection />
      <TagsGridSection />
      <BecomeCuratorSection />
    </div>
  );
}
