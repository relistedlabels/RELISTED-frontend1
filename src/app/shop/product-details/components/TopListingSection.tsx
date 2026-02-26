"use client";

import ProductCard from "@/common/ui/ProductCard";
import { motion, useAnimation, useMotionValue } from "framer-motion";
import { Header1Plus, Paragraph1 } from "@/common/ui/Text";
import { useEffect, useRef, useState } from "react";
import { useProducts } from "@/lib/queries/product/useProducts";
import { ProductCardSkeleton } from "@/common/ui/SkeletonLoaders";

export default function TopListingSection() {
  const { data: products = [], isLoading, error } = useProducts();

  // Duplicate items for seamless scroll
  const duplicatedProducts = [...products, ...products];

  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const x = useMotionValue(0); // track position

  const [distance, setDistance] = useState(0);
  const [autoScrolling, setAutoScrolling] = useState(true);
  const [speed, setSpeed] = useState(30);

  // Detect screen + adjust speed
  useEffect(() => {
    const checkScreen = () => setSpeed(window.innerWidth < 768 ? 40 : 120);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // Calculate scrollable distance
  useEffect(() => {
    if (containerRef.current) {
      setDistance(containerRef.current.scrollWidth / 2);
    }
  }, [containerRef.current]);

  // Auto-scroll function
  const startAutoScroll = (currentX = 0) => {
    if (!distance) return;
    controls.start({
      x: [-currentX, -distance - currentX],
      transition: {
        duration: speed,
        ease: "linear",
        repeat: Infinity,
      },
    });
  };

  // Start/stop auto-scroll based on state
  useEffect(() => {
    if (autoScrolling) {
      startAutoScroll(-x.get() % distance);
    } else {
      controls.stop();
    }
  }, [autoScrolling, distance, speed]);

  if (isLoading || error) {
    return (
      <section className="py-12 px-4 sm:px-0 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Header1Plus className="tracking-wide uppercase">
              You might also like
            </Header1Plus>
          </div>
          <ProductCardSkeleton count={6} />
        </div>
      </section>
    );
  }

  const handleDragStart = () => {
    setAutoScrolling(false);
  };

  const handleDragEnd = () => {
    const currentX = x.get(); // get current drag position
    setTimeout(() => {
      setAutoScrolling(true);
      startAutoScroll(-currentX % distance); // resume from current position
    }, 200); // short delay to avoid jump
  };

  return (
    <section className="py-12 px-4 sm:px-0 bg-white">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Header1Plus className="tracking-wide uppercase">
            You might also like
          </Header1Plus>
        </div>

        {/* Scrollable + Auto-moving Row */}
        <div className="overflow-hidden w-full relative">
          <motion.div
            ref={containerRef}
            className="flex gap-4 sm:gap-6 cursor-grab active:cursor-grabbing"
            drag="x"
            style={{ x }}
            dragConstraints={{ left: -distance, right: 0 }}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            animate={controls}
          >
            {duplicatedProducts.map((item, index) => (
              <div key={index} className="min-w-[260px] max-w-[260px]">
                <ProductCard
                  id={item.id}
                  image={
                    item.attachments?.uploads?.[0]?.url || "/placeholder.jpg"
                  }
                  brand={item.brand?.name || "BRAND"}
                  name={item.name}
                  price={`₦${item.originalValue.toLocaleString()}`}
                  dailyPrice={item.dailyPrice}
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
