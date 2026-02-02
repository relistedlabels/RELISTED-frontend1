import React from "react";
import AboutUsSection from "./sections/AboutUsSection";
import OurMissionSection from "./sections/OurMissionSection";
import OurTeamSection from "./sections/OurTeamSection";
import ExploreSection from "./sections/ExploreSection";
import FAQSection from "./sections/FAQSection";

export default function page() {
  return (
    <div>
      <AboutUsSection />
      <OurMissionSection />
      <OurTeamSection />
      <ExploreSection />
      <FAQSection />
    </div>
  );
}
