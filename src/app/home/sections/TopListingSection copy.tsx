"use client";

import ProductCard from "@/common/ui/ProductCard";
import { motion, useAnimation, useMotionValue } from "framer-motion";
import { products } from "@/data/productsData";
import { Header1Plus, Header1, Paragraph1 } from "@/common/ui/Text";
import { useEffect, useRef, useState } from "react";

// Duplicate items for seamless scroll
const duplicatedProducts = [...products, ...products];

export default function TopListingSection() {
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
        <div className="text-center mb-12">
          <Header1Plus className="tracking-wide uppercase">
            TOP LISTINGS
          </Header1Plus>
          <Paragraph1 className="text-gray-600">
            Discover popular looks this week.{" "}
            <a className="underline cursor-pointer">SHOP NOW</a>
          </Paragraph1>
        </div>

        {/* Scrollable + Auto-moving Row */}
        <div className="overflow-hidden w-full relative">
          <motion.div
            ref={containerRef}
            className="flex gap-1 sm:gap-4 cursor-grab active:cursor-grabbing"
            drag="x"
            style={{ x }}
            dragConstraints={{ left: -distance, right: 0 }}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            animate={controls}
          >
            {duplicatedProducts.map((item, index) => (
              <div className="min-w-[260px] max-w-[260px] sm:w-[300px]" key={index}>
                <ProductCard
                  id={item.id}
                  image={item.image}
                  brand={item.brand}
                  name={item.name}
                  price={item.price}
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
