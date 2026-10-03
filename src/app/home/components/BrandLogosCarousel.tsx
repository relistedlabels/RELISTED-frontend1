// ENDPOINTS: GET /api/public/brands

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Header2Plus } from "@/common/ui/Text";
import type { Brand } from "@/lib/api/brands";
import { useBrands } from "@/lib/queries/brand/useBrands";

export default function BrandLogosCarousel() {
  const { data: brands, isLoading, error } = useBrands();
  const [shuffledBrands, setShuffledBrands] = useState<Brand[]>([]);
  const hasShuffled = useRef(false);

  useEffect(() => {
    if (!brands || hasShuffled.current) return;

    hasShuffled.current = true;
    const visible = brands.filter((brand) => brand.isShopVisible === true);
    for (let index = visible.length - 1; index > 0; index--) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [visible[index], visible[randomIndex]] = [
        visible[randomIndex],
        visible[index],
      ];
    }
    setShuffledBrands(visible.slice(0, 10));
  }, [brands]);

  if (isLoading) return null;
  if (error) return null;

  return (
    <div className="w-full container px-4 sm:px-0 mx-auto py-4 sm:py-[17px] bg-whit ">
      <div className="flex sm:justify-center text-gray-600 overflow-hidden overflow-x-auto hide-scrollbar scrollbar-hide gap-1 sm:gap-14 px-">
        {shuffledBrands.map((brand) => (
          <Link
            key={brand.id}
            href={`/shop?brand=${encodeURIComponent(brand.name)}&title=${encodeURIComponent(brand.name)}&description=${encodeURIComponent(`Shop ${brand.name} fashion`)}`}
          >
            <motion.div
              className="shrink-0 cursor-pointer  px-2  text-[16px] sm:text-[24px] whitespace-nowrap"
              whileHover={{ scale: 1.12 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <Header2Plus> {brand.name}</Header2Plus>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
