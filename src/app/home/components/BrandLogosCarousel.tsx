// ENDPOINTS: GET /brands
"use client";

import { useBrands } from "@/lib/queries/brand/useBrands";
import { Header2Plus } from "@/common/ui/Text";
import { motion } from "framer-motion";
import Link from "next/link";

export default function BrandLogosCarousel() {
  const { data: brands, isLoading, error } = useBrands();

  if (isLoading) return null;
  if (error) return null;

  return (
    <div className="w-full container px-4 sm:px-0 mx-auto py-4 sm:py-[17px] bg-whit ">
      <div className="flex sm:justify-center overflow-hidden overflow-x-auto hide-scrollbar scrollbar-hide gap-1 sm:gap-14 px-">
        {brands &&
          brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/shop?brand=${encodeURIComponent(brand.name)}&title=${encodeURIComponent(brand.name)}&description=${encodeURIComponent(`Shop ${brand.name} fashion`)}`}
            >
              <motion.div
                className="shrink-0 cursor-pointer  px-2  text-[14px] sm:text-[24px] whitespace-nowrap"
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
