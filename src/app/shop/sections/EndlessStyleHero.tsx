"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Header1, Header3, Header4, Header5, HeaderAny, Paragraph1, ParagraphAny, SpecialH1 } from "@/common/ui/Text";
import Button from "@/common/ui/Button";
import { useSearchParams } from "next/navigation";

export default function EndlessStyleHero() {
  const searchParams = useSearchParams();

  // Get title and description from URL params
  const pageTitle = searchParams.get("title") || "Shop amazing";
  const pageDescription = searchParams.get("description") || "Style Brands";
  return (
    <section className="w-full  pt-[70px] sm:pt-[100px] px-4 md:px-10 bg-white py-4 ">
      {/* Title */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
        className="container mx-auto"
        transition={{ duration: 0.8 }}
      >
        <HeaderAny className=" text-[28px] sm:text-[44px]">
          {pageTitle}
        </HeaderAny>
        <ParagraphAny className="line-clamp-1 text-[12px] sm:text-[12px] sm:line-clamp-none">
          {pageDescription}
        </ParagraphAny>
      </motion.div>
    </section>
  );
}
