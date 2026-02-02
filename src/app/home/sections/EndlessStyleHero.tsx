"use client";

import React from "react";
import { motion } from "framer-motion";
import { Header1, SpecialH1 } from "@/common/ui/Text";
import Button from "@/common/ui/Button";
import HeroVideo from "./HeroVideo";

export default function EndlessStyleHero() {
  return (
    <section className="relative w-full h-screen overflow-hidden bg-black">
      {/* Background Video */}
      <HeroVideo />

      {/* Dark Overlay */}
      <motion.div
        className="absolute inset-0 bg-black/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />

      {/* Center Content */}
      <motion.div
        className="absolute inset-0 pt-10 flex flex-col items-center justify-center text-center text-white px-6"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, ease: "easeOut" }}
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.25 } },
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
            <Header1>Endless Style</Header1>
          </motion.div>

          {/* Sub Text */}
          <motion.p
            className="text-[58px] md:text-[58px] italic -mt-2 sm:-mt-1 mb-4"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.9 }}
          >
            <SpecialH1>short plans, long compliments</SpecialH1>
          </motion.p>

          {/* Buttons */}
          <motion.div
            className="flex gap-4 justify-center"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 1 }}
          >
            <Button
              text="Start Shopping"
              isLink={true}
              href="/shop"
              backgroundColor="bg-white"
              color="text-black hover:text-white"
              border="border border-white"
            />

            <Button
              text="List Items"
              isLink={true}
              href="/auth/create-account"
              backgroundColor="bg-transparent"
              border="border border-white"
              color="text-white"
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
