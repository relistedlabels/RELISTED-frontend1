"use client";

import { Header2Plus } from "@/common/ui/Text";
import { motion } from "framer-motion";
import Link from "next/link";

const brands = [
  "Chanel",
  "Louis Vuitton",
  "Prada",
  "Denim Tears",
  "Calvin Klein",
  // add more anytime…
];

export default function BrandLogosCarousel() {
  return (
    <div className="w-full container px-4 sm:px-0 mx-auto py-4 sm:py-[17px] bg-whit ">
      <div className="flex sm:justify-center overflow-hidden overflow-x-auto hide-scrollbar scrollbar-hide gap-1 sm:gap-14 px-">
        {brands.map((brand, index) => (
          <Link key={index} href="/shop">
            <motion.div
              className="shrink-0 cursor-pointer  px-2  text-[14px] sm:text-[24px] whitespace-nowrap"
              whileHover={{ scale: 1.12 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <Header2Plus> {brand}</Header2Plus>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
