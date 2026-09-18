import BrandLogosCarousel from "./home/components/BrandLogosCarousel";
import HomePageWithSaleBanner from "./home/components/HomePageWithSaleBanner";
import BecomeCurator from "./home/sections/BecomeCurator";
import EndlessStyleHero from "./home/sections/EndlessStyleHero";
import FeaturedShopSaleSection from "./home/sections/FeaturedShopSaleSection";
import HomeProductRail from "./home/sections/HomeProductRail";
import PopularCategorySection from "./home/sections/PopularCategorySection";
import HowItWorks from "./home/sections/HowItWorks";

export default function Home() {
  return (
    <HomePageWithSaleBanner>
      <EndlessStyleHero />

      <HomeProductRail
        title="New In"
        subtitle="Fresh pieces ready to rent or buy."
        viewAllHref="/shop?listingType=RENTAL,RENT_OR_RESALE&sort=newest"
        sort="newest"
        limit={10}
      />

      <BrandLogosCarousel />
      <FeaturedShopSaleSection />

      <PopularCategorySection />

      <HomeProductRail
        title="Most Rented"
        subtitle="Popular picks from the community."
        viewAllHref="/shop?listingType=RENTAL,RENT_OR_RESALE&sort=popular"
        sort="popular"
        filters={{ listingTypes: ["RENTAL", "RENT_OR_RESALE"] }}
        limit={10}
      />

      <HowItWorks />

      <div className="px-4 sm:px-0">
        <BecomeCurator />
      </div>
    </HomePageWithSaleBanner>
  );
}
