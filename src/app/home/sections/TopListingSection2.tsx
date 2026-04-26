// ENDPOINTS: GET /api/public/products

"use client";

import ProductCard from "@/common/ui/ProductCard";
import { Header1Plus, Paragraph1 } from "@/common/ui/Text";
import { useRef } from "react";
import { useProducts } from "@/lib/queries/product/useProducts";
import { ProductCardSkeleton } from "@/common/ui/SkeletonLoaders";
import Link from "next/link";

const TopListingSection = () => {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  // const { data: products, isLoading, error } = useProducts();
  const {
    data: products,
    isLoading,
    error,
  } = useProducts({
    sort: "newest",
    tags: "Vacation",
    limit: 7,
  });
  // Convert vertical wheel to horizontal scroll for mouse users
  const onWheel = (e: React.WheelEvent) => {
    const el = scrollerRef.current;
    if (!el) return;

    // If the user is actually scrolling horizontally (deltaX present) allow it,
    // otherwise convert vertical wheel to horizontal.
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      // let native horizontal wheel happen
      return;
    }

    // convert vertical scroll into horizontal scroll
    el.scrollLeft += e.deltaY;
    e.preventDefault();
  };

  if (isLoading) {
    return (
      <section className="bg-white px-4 sm:px-0 py-6 sm:py-12">
        <div className="mx-auto container">
          <div className="mb-2 sm:mb-6 text-center">
            <Header1Plus className="uppercase tracking-wide">
              VACATION OUTFITS
            </Header1Plus>
          </div>
          <ProductCardSkeleton count={6} />
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
              VACATION OUTFITS
            </Header1Plus>
          </div>
          <ProductCardSkeleton count={6} />
        </div>
      </section>
    );
  }

  const displayProducts = products || [];

  return (
    <section className="bg-white px-4 sm:px-0 py-6 sm:py-12">
      <br />{" "}
      <div className="mx-auto container">
        {/* Header */}
        <div className="flex flex-col justify-center items-center mb-2 sm:mb-6 text-center">
          <Header1Plus className="uppercase tracking-wide">
            VACATION OUTFITS
          </Header1Plus>
          <Paragraph1 className="max-w-[280px] sm:max-w-[480px] text-gray-600">
            Explore amazing outfits that elevate your looks for your vacation
            and short trips
          </Paragraph1>
          <Link
            href={`/shop?tags=${encodeURIComponent("Vacation")}&title=${encodeURIComponent("VACATION OUTFITS")}`}
            className="mt-4 text-sm font-bold border-b hover:opacity-70 transition-opacity"
          >
            Browse All →
          </Link>
        </div>

        {/* Products or No Products Message */}
        {displayProducts.length === 0 ? (
          <div className="py-12 text-center">
            <Paragraph1 className="text-gray-600">
              No products here currently...
            </Paragraph1>
          </div>
        ) : (
          /* Native horizontal scroll — gestures will work */
          <div
            ref={scrollerRef}
            onWheel={onWheel}
            // styles: horizontal scroll, hide vertical overflow, enable momentum scrolling on iOS
            style={{
              WebkitOverflowScrolling: "touch",
            }}
            className="relative w-full overflow-x-auto overflow-y-hidden hide-scrollbar"
          >
            <div
              // keep items in a single row
              className="flex gap-2 sm:gap-4 px-2"
              // prefer native touch behavior (don't intercept pointer events)
            >
              {displayProducts.map((product, index) => (
                <div
                  key={`${product.id}-${index}`}
                  className="w-[170px] sm:w-[200px] xl:w-[210px] shrink-0"
                >
                  <ProductCard
                    id={product.id}
                    image={
                      product.attachments?.uploads?.[0]?.url ||
                      "/placeholder.jpg"
                    }
                    brand={product.brand?.name || "BRAND"}
                    name={product.name}
                    price={`₦${(product.originalValue || 0).toLocaleString()}`}
                    dailyPrice={product.dailyPrice}
                    resalePrice={product.resalePrice}
                    listingType={product.listingType}
                    size={product.measurement}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex- hidden justify-center items-center mt-2 w-full">
          <Link
            href={`/shop?tags=${encodeURIComponent("Vacation")}&title=${encodeURIComponent("VACATION OUTFITS")}`}
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
