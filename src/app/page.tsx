import BrandLogosCarousel from "./home/components/BrandLogosCarousel";
import HomePageWithSaleBanner from "./home/components/HomePageWithSaleBanner";
import BecomeCurator from "./home/sections/BecomeCurator";
import EndlessStyleHero from "./home/sections/EndlessStyleHero";
import FeaturedShopSaleSection from "./home/sections/FeaturedShopSaleSection";
import PopularCategorySection from "./home/sections/PopularCategorySection";
import HomeMidSections from "./home/components/HomeMidSections";

export default function Home() {
  return (
    <HomePageWithSaleBanner>
      <EndlessStyleHero />
      <BrandLogosCarousel />
      <FeaturedShopSaleSection />
      <PopularCategorySection />
      <HomeMidSections />

      <div className="px-4 sm:px-0">
        <BecomeCurator />
      </div>
      <br className="sm:hidden flex" />
    </HomePageWithSaleBanner>
  );
}
