"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Header1, Header5, Paragraph1, SpecialH1 } from "@/common/ui/Text";
import Button from "@/common/ui/Button";
import { useSearchParams } from "next/navigation";

export default function EndlessStyleHero() {
  const searchParams = useSearchParams();

  // Get title and description from URL params
  const pageTitle = searchParams.get("title") || "Shop amazing";
  const pageDescription = searchParams.get("description") || "Style Brands";
  return (
    <section className="relative w-full h-[20vh] mt-16   sm:h-[50vh] overflow-hidden">
      {/* Background Image */}
      <Image
        src="/images/shoph.jpg"
        alt="Hero Background"
        fill
        className="object-cover object-top"
        priority
      />

      {/* Dark Overlay */}
      <motion.div
        className="absolute inset-0 bg-black/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />

      {/* Center Content */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, ease: "easeOut" }}
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.25,
              },
            },
          }}
        >
          {/* Title */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.8 }}
          >
            <Header1 className="">{pageTitle}</Header1>
          </motion.div>

          {/* Sub Text */}
          <motion.p
            className=" sm:mt-8 mt-2"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.9 }}
          >
            <Header5 className="line-clamp-1 sm:line-clamp-none">
              {pageDescription}
            </Header5>
          </motion.p>
        </motion.div>
      </motion.div>
    </section>
  );
}
