"use client";

import ProductCard from "@/common/ui/ProductCard";
import { products } from "@/data/productsData";
import { Header1Plus, Paragraph1 } from "@/common/ui/Text";
import { useRef } from "react";

const duplicatedProducts = [...products, ...products];

export default function TopListingSection() {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

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
            <a className="underline cursor-pointer">SHOP NOW</a>
          </Paragraph1>
        </div>

        {/* Native horizontal scroll — gestures will work */}
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
            {duplicatedProducts.map((item, index) => (
              <div key={index} className="min-w-[170px] max-w-[170px] shrink-0">
                <ProductCard
                  image={item.image}
                  brand={item.brand}
                  name={item.name}
                  price={item.price}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
