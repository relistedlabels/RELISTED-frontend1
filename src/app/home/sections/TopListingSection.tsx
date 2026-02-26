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
  const { data: products, isLoading, error } = useProducts();

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
      <section className="py-6 sm:py-12 px-4 sm:px-0 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-2 sm:mb-6">
            <Header1Plus className="tracking-wide uppercase">
              TOP LISTINGS
            </Header1Plus>
          </div>
          <ProductCardSkeleton count={6} />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-6 sm:py-12 px-4 sm:px-0 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-2 sm:mb-6">
            <Header1Plus className="tracking-wide uppercase">
              TOP LISTINGS
            </Header1Plus>
          </div>
          <ProductCardSkeleton count={6} />
        </div>
      </section>
    );
  }

  const displayProducts =
    products && products.length > 0 ? [...products, ...products] : [];

  return (
    <section className="py-6 sm:py-12 px-4 sm:px-0 bg-white">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-2 sm:mb-6">
          <Header1Plus className="tracking-wide uppercase">
            TOP LISTINGS
          </Header1Plus>
          <Paragraph1 className="text-gray-600">
            Discover popular looks this week.{" "}
            <Link href="/shop?title=Top+Listings&description=Discover+popular+looks+this+week">
              <span className="underline cursor-pointer">SHOP NOW</span>
            </Link>
          </Paragraph1>
        </div>

        {/* Products or No Products Message */}
        {displayProducts.length === 0 ? (
          <div className="text-center py-12">
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
            className="w-full relative overflow-x-auto hide-scrollbar overflow-y-hidden"
          >
            <div
              // keep items in a single row
              className="flex gap-2 sm:gap-4 px-2"
              // prefer native touch behavior (don't intercept pointer events)
            >
              {displayProducts.map((product, index) => (
                <div
                  key={`${product.id}-${index}`}
                  className="w-[170px] sm:w-[250px] shrink-0"
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
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default TopListingSection;
