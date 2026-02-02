"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useAnimation, useMotionValue } from "framer-motion";
import {
  Header1Plus,
  Paragraph1,
  Paragraph2,
  ParagraphLink1,
} from "@/common/ui/Text";

interface Curator {
  name: string;
  image: string;
  shopLink: string;
}

const curators: Curator[] = [
  {
    name: "Estelle Hansworth",
    image: "/images/cro1.jpg",
    shopLink: "/shop/estelle",
  },
  { name: "Sam Kays", image: "/images/cro2.jpg", shopLink: "/shop/sam" },
  { name: "Jerry Brown", image: "/images/cro3.jpg", shopLink: "/shop/jerry" },
  { name: "D2 Collections", image: "/images/cro4.jpg", shopLink: "/shop/d2" },
];

const duplicatedCurators = [...curators, ...curators];

export default function TopCuratorsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const x = useMotionValue(0);

  const [distance, setDistance] = useState(0);
  const [autoScrolling, setAutoScrolling] = useState(true);
  const [speed, setSpeed] = useState(40);

  // Adjust speed for screen size
  useEffect(() => {
    const checkScreen = () => setSpeed(window.innerWidth < 768 ? 50 : 140);
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

  useEffect(() => {
    if (autoScrolling) {
      startAutoScroll(-x.get() % distance); // continue from current position
    } else {
      controls.stop();
    }
  }, [autoScrolling, distance, speed]);

  const handleDragStart = () => {
    setAutoScrolling(false);
  };

  const handleDragEnd = () => {
    const currentX = x.get(); // get current motion value
    setTimeout(() => {
      setAutoScrolling(true);
      startAutoScroll(-currentX % distance); // continue from drag position
    }, 200); // small delay to avoid jump
  };

  return (
    <section className="w-full py-6 sm:py-[50px] bg-white">
      <div className="text-center mb-4 sm:mb-10">
        <Header1Plus className="tracking-wide">TOP CURATORS</Header1Plus>
        <Paragraph1 className="text-gray-500 mt-1">
          Wardrobe liked by many.{" "}
          <a className="underline cursor-pointer">VIEW ALL</a>
        </Paragraph1>
      </div>

      <div className="relative overflow-hidden w-full">
        <motion.div
          ref={containerRef}
          className="flex gap-2 sm:gap-[25px] cursor-grab active:cursor-grabbing"
          drag="x"
          style={{ x }}
          dragConstraints={{ left: -distance, right: 0 }}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          animate={controls}
        >
          {duplicatedCurators.map((curator, index) => (
            <div
              key={index}
              className="min-w-[200px] sm:min-w-[345px] h-[270px] sm:h-[435px] overflow-hidden relative shadow-md "
              style={{
                backgroundImage: `url(${curator.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute bottom-0 w-full py-[60px] px-[30px] text-white bg-linear-to-t from-black/70 to-transparent">
                <Paragraph1 className="text-xs opacity-80">
                  CURATED BY
                </Paragraph1>
                <Paragraph2 className="font-medium">{curator.name}</Paragraph2>

                <a
                  href={curator.shopLink}
                  className="text-sm underline mt-1 inline-flex items-center gap-1"
                >
                  <ParagraphLink1>Shop Now</ParagraphLink1>
                </a>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
