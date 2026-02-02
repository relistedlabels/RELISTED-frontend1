
import BrandLogosCarousel from "./home/components/BrandLogosCarousel";
import BecomeCurator from "./home/sections/BecomeCurator";
import EndlessStyleHero from "./home/sections/EndlessStyleHero";
import HowItWorks from "./home/sections/HowItWorks";
import MainCategorySection from "./home/sections/MainCategorySection";
import PopularCategorySection from "./home/sections/PopularCategorySection";
import ReviewCarousel from "./home/sections/ReviewCarousel";
import TopCuratorsSection from "./home/sections/TopCuratorsSection";
import TopListingSection from "./home/sections/TopListingSection";

export default function Home() {
 
  return (
    <div>
      <EndlessStyleHero />
      <BrandLogosCarousel />
      <MainCategorySection />
      <TopListingSection />
      <PopularCategorySection />
      <BecomeCurator />
      <TopCuratorsSection />
      <HowItWorks />
      <ReviewCarousel />
    </div>
  );
}
