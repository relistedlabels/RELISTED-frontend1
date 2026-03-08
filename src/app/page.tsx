
import BrandLogosCarousel from "./home/components/BrandLogosCarousel";
import BecomeCurator from "./home/sections/BecomeCurator";
import EndlessStyleHero from "./home/sections/EndlessStyleHero";
import HowItWorks from "./home/sections/HowItWorks";
import MainCategorySection from "./home/sections/MainCategorySection";
import PopularCategorySection from "./home/sections/PopularCategorySection";
import ReviewCarousel from "./home/sections/ReviewCarousel";
import TopCuratorsSection from "./home/sections/TopCuratorsSection";
import TopListingSection1 from "./home/sections/TopListingSection1";
import TopListingSection2 from "./home/sections/TopListingSection2";

export default function Home() {
 
  return (
    <div>
      <EndlessStyleHero />
      <BrandLogosCarousel />
      <PopularCategorySection />

      {/* <MainCategorySection /> */}
      <HowItWorks />

      <TopListingSection2 />
      <TopListingSection1 />

      <BecomeCurator />
      {/* <TopCuratorsSection /> */}
      <br />
      <br />
      {/* <ReviewCarousel /> */}
    </div>
  );
}
