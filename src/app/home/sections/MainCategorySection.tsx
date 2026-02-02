"use client";

import Button from "@/common/ui/Button";
import { Header2, HeaderAny } from "@/common/ui/Text";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function MainCategorySection() {
  const cardAnimationLeft: Variants = {
    hidden: { opacity: 0, x: -120 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.9, ease: "easeOut" },
    },
  };

  const cardAnimationRight: Variants = {
    hidden: { opacity: 0, x: 120 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.9, ease: "easeOut" },
    },
  };

  return (
    <section className="w-full mx-auto px-4 sm:px-0 container py-4-">
      <div className="grid grid-cols-2 md:grid-cols-2 gap-2 sm:gap-4 [43px]">
        {/* WOMEN */}
        <motion.div
          variants={cardAnimationRight}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="relative h-[210px] md:h-[650px] group overflow-hidden  cursor-pointer"
        >
          <Image
            src="/images/womansec.jpg"
            alt="Women Category"
            fill
            className="object-cover transition-transform duration-3000 ease-in-out group-hover:scale-110"
          />

          <div className="absolute inset-0 bg-black/30"></div>

          <Link
            href="/shop"
            className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4"
          >
            <HeaderAny className=" text-[14px] sm:text-[28px] font-semibold mb-1 sm:mb-4">
              Women’s Collections
            </HeaderAny>
            <div className=" hidden- sm: block">
              <Button
                text="Shop Now"
                isLink={true}
                href="/shop"
                backgroundColor="bg-transparent"
                border="border border-white"
                color="text-white"
              />
            </div>{" "}
          </Link>
        </motion.div>

        {/* MEN */}
        <motion.div
          variants={cardAnimationLeft}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="relative h-[210px] md:h-[650px] group overflow-hidden  cursor-pointer"
        >
          <Image
            src="/images/mensec.jpg"
            alt="Men Category"
            fill
            className="object-cover transition-transform duration-3000 ease-in-out group-hover:scale-110"
          />

          <div className="absolute inset-0 bg-black/30"></div>

          <Link
            href="/shop" className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
            <HeaderAny className=" text-[14px] sm:text-[28px] font-semibold mb-2 sm:mb-4">
              Men's Collections
            </HeaderAny>
            <div className=" hidden- sm: block">
              <Button
                text="Shop Now"
                isLink={true}
                href="/shop"
                backgroundColor="bg-transparent"
                border="border border-white"
                color="text-white"
              />
            </div>{" "}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
