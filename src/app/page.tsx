import BrandLogosCarousel from "./home/components/BrandLogosCarousel";
import BecomeCurator from "./home/sections/BecomeCurator";
import EndlessStyleHero from "./home/sections/EndlessStyleHero";
import PopularCategorySection from "./home/sections/PopularCategorySection";
import HomeMidSections from "./home/components/HomeMidSections";

export default function Home() {
  return (
    <div>
      <EndlessStyleHero />
      <BrandLogosCarousel />
      <PopularCategorySection />
      <HomeMidSections />

      <div className="px-4 sm:px-0">
        <BecomeCurator />
      </div>
      <br className="sm:hidden flex" />
    </div>
  );
}
