import React from "react";
import StyleSpotlightHero from "./sections/StyleSpotlightHero";
import StyleCategoriesSection from "./sections/StyleCategoriesSection";
import MeetCuratorsSection from "./sections/MeetCuratorsSection";
import BecomeCuratorSection from "./sections/BecomeCuratorSection";

export default function StyleSpotlightPage() {
  return (
    <div>
      <StyleSpotlightHero />
      <MeetCuratorsSection />
      <StyleCategoriesSection />
      <BecomeCuratorSection />
    </div>
  );
}
