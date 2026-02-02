"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Header1, Header1Plus, Header2, Paragraph1 } from "@/common/ui/Text";
import Button from "@/common/ui/Button";

export default function ExploreSection() {
  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Background Image */}
      <Image
        src="/images/expolbg.jpg"
        alt="Hero Background"
        fill
        className="object-cover"
        priority
      />

      {/* Dark Overlay */}
      <motion.div
        className="absolute inset-0 bg-black/50"
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
            <Header2 className=" mb-4 max-w-[500px]">
              Elevate Your Wardrobe with Timeless Fashion
            </Header2>
          </motion.div>

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
              text="EXPLORE PRODUCTS"
              backgroundColor="bg-white"
              color="text-black hover:text-white"
              border="border border-white"
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
