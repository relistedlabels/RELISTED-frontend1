// ENDPOINTS: GET /api/public/products (closet inventory for home strip)

"use client";

import ProductCard from "@/common/ui/ProductCard";
import { Header1Plus, Paragraph1 } from "@/common/ui/Text";
import { useRef } from "react";
import { useHorizontalWheelScroll } from "@/hooks/useHorizontalWheelScroll";
import { useProducts } from "@/lib/queries/product/useProducts";
import { ProductCardSkeleton } from "@/common/ui/SkeletonLoaders";
import Link from "next/link";
import { primaryProductHeroImage } from "@/lib/product/primaryProductHeroImage";
import { VAULT_CLOSET_DROPS_BROWSE_SHOP_HREF } from "@/lib/nav/vaultClosetDropsShop";

const vaultClosetDropsSectionTitle = "The Vault Closet Sale";

const browseShopHref = VAULT_CLOSET_DROPS_BROWSE_SHOP_HREF;

const TopListingSection = () => {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const {
    data: products,
    isLoading,
    error,
  } = useProducts({
    sort: "newest",
    onlyWithCloset: true,
    limit: 7,
  });

  const displayProductsEarly = products ?? [];
  useHorizontalWheelScroll(
    scrollerRef,
    !isLoading && !error && displayProductsEarly.length > 0,
  );

  if (isLoading) {
    return (
      <section className="bg-white px-4 sm:px-0 py-6 sm:py-12">
        <div className="mx-auto container">
          <div className="mb-2 sm:mb-6 text-center">
            <Header1Plus className="uppercase tracking-wide">
              {vaultClosetDropsSectionTitle}
            </Header1Plus>
          </div>
          <ProductCardSkeleton count={4} />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-white px-4 sm:px-0 py-6 sm:py-12">
        <div className="mx-auto container">
          <div className="mb-2 sm:mb-6 text-center">
            <Header1Plus className="uppercase tracking-wide">
              {vaultClosetDropsSectionTitle}
            </Header1Plus>
            <Paragraph1 className="text-gray-600">
              Celebrity wardrobes. Limited drops. Shop it before it disappears.
            </Paragraph1>
          </div>
          <ProductCardSkeleton count={6} />
        </div>
      </section>
    );
  }

  const displayProducts = displayProductsEarly;

  return (
    <section className="bg-white px-4 sm:px-0 py-6 sm:py-12">
      <div className="mx-auto container">
        <div className="flex flex-col justify-center items-center mb-2 sm:mb-6 text-center">
          <div className="flex items-center gap-4">
            <Header1Plus className="uppercase tracking-wide">
              {vaultClosetDropsSectionTitle}{" "}
            </Header1Plus>

            <div className="hidden sm:block bg-black px-4 py-1 rounded-full text-[12px] text-white">
              New
            </div>
          </div>

          <Paragraph1 className="max-w-[280px] sm:max-w-[480px] text-gray-600">
            Celebrity wardrobes. Limited drops. Shop it before it disappears.
          </Paragraph1>
          <Link
            href={browseShopHref}
            className="hover:opacity-70 mt-4 border-b font-bold text-sm transition-opacity"
          >
            Browse All →
          </Link>
        </div>

        {displayProducts.length === 0 ? (
          <div className="py-12 text-center">
            <Paragraph1 className="text-gray-600">
              No products here currently...
            </Paragraph1>
          </div>
        ) : (
          <div
            ref={scrollerRef}
            style={{
              WebkitOverflowScrolling: "touch",
            }}
            className="relative w-full overflow-x-auto overflow-y-hidden hide-scrollbar"
          >
            <div className="flex gap-2 sm:gap-4 px-2">
              {displayProducts.map((product, index) => (
                <div
                  key={`${product.id}-${index}`}
                  className="w-[170px] sm:w-[200px] xl:w-[210px] shrink-0"
                >
                  <ProductCard
                    id={product.id}
                    image={primaryProductHeroImage(product)}
                    brand={product.brand?.name || "BRAND"}
                    name={product.name}
                    price={`₦${(product.originalValue || 0).toLocaleString()}`}
                    dailyPrice={product.dailyPrice}
                    resalePrice={product.resalePrice}
                    listingType={product.listingType}
                    size={product.measurement}
                    closetOwner={product.closet?.name}
                    closetImage={product.closet?.imageUrl ?? undefined}
                    isSold={product.status === "SOLD"}
                    isRentedOut={product.status === "RENTED"}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-center items-center mt-2 w-full">
          <Link
            href={browseShopHref}
            className="inline-flex justify-center items-center bg-black hover:bg-neutral-800 px-8 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 w-full max-w-md font-medium text-white text-sm tracking-wider transition-colors duration-200"
            aria-label="Browse all items"
          >
            <Paragraph1 className="text-white">Browse All</Paragraph1>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TopListingSection;
