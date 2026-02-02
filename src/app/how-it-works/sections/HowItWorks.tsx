"use client";

import Button from "@/common/ui/Button";
import { Header1Plus, Paragraph1 } from "@/common/ui/Text";
import Image from "next/image";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.25 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export default function HowItWorks() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
      className="pt-[85px] sm:pt-[100px] px-4 md:px-0 py-12 bg-white"
    >
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 items-center">
        {/* Floating Image */}
        <div className="order-2 md:order-1 w-full">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="relative w-full h-[400px] md:h-screen"
          >
            <Image
              src="/images/bagbg.jpg"
              alt="About Us"
              fill
              className="object-cover "
            />
          </motion.div>
        </div>

        {/* Text Content */}
        <motion.div
          variants={containerVariants}
          className="order-1 md:order-2 w-full pb-8 sm:pb-0 md:pl-12"
        >
          <motion.div variants={fadeUp} transition={{ duration: 0.8 }}>
            <Paragraph1 className="text-sm text-gray-500 mb-2">
              HOW IT WORKS
            </Paragraph1>
          </motion.div>

          <motion.div variants={fadeUp} transition={{ duration: 0.8 }}>
            <Header1Plus className="text-3xl md:text-4xl font-semibold mb-6">
              ACCESS. EARN. ELEVATE.
            </Header1Plus>
          </motion.div>

          <motion.div variants={fadeUp} transition={{ duration: 0.8 }}>
            <Paragraph1 className="mb-6">
              Relisted makes fashion circular connecting those who want to wear
              standout pieces with those who own them.
            </Paragraph1>
          </motion.div>

          {/* Buttons */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.8 }}
            className="flex gap-4 justify-center md:justify-start"
          >
            <motion.div>
              <Button
                text="Start Shopping"
                backgroundColor="bg-black"
                color="text-white"
                border="border border-black"
              />
            </motion.div>

            <motion.div>
              <Button
                text="List Items"
                backgroundColor="bg-transparent"
                border="border border-black"
                color="text-black hover:text-white"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}
