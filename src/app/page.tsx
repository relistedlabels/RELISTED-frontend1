import BrandLogosCarousel from "./home/components/BrandLogosCarousel";
import VaultClosetSaleBanner from "./home/components/VaultClosetSaleBanner";
import { isVaultClosetSaleBannerVisible } from "@/lib/vaultClosetSaleDates";
import BecomeCurator from "./home/sections/BecomeCurator";
import EndlessStyleHero from "./home/sections/EndlessStyleHero";
import PopularCategorySection from "./home/sections/PopularCategorySection";
import HomeMidSections from "./home/components/HomeMidSections";

export default function Home() {
  const reserveNavForSaleBanner = isVaultClosetSaleBannerVisible();

  return (
    <div
      className={
        reserveNavForSaleBanner ? "pt-20 xl:pt-19.25" : undefined
      }
    >
      <VaultClosetSaleBanner />
      <EndlessStyleHero />
      <BrandLogosCarousel />
      <PopularCategorySection />
      <HomeMidSections />
      {/* <TopCuratorsSection /> */}

      <div className=" px-4 sm:px-0">
        <BecomeCurator />
      </div>
      {/* <br /> */}
      <br className=" flex sm:hidden" />
      {/* <ReviewCarousel /> */}
    </div>
  );
}
