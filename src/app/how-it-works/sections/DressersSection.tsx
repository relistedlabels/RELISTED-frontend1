"use client";

import Image from "next/image";
import { Header1Plus, Header5, Paragraph1 } from "@/common/ui/Text";
import Button from "@/common/ui/Button";
import { dresserSteps } from "@/data/dresserSteps";
import { motion } from "framer-motion";

export default function DressersSection() {
  return (
    <section className="w-full bg-black text-white py-20">
      {/* Top Content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
        className="text-center flex flex-col items-center px-4 max-w-3xl mx-auto mb-16"
      >
        <Paragraph1 className="tracking-widest text-sm">DRESSERS</Paragraph1>
        <hr className="mb-8 w-full" />

        <Header1Plus className="mb-6">
          ELEVATE YOUR STYLE
          <br />
          WITHOUT THE COMMITMENT.
        </Header1Plus>

        <Paragraph1 className="text-gray-300 mb-8 text-sm md:text-base">
          We believe in giving style a second life—making luxury accessible,
          sustainable, and community-powered through trusted rentals.
        </Paragraph1>

        <Button
          text="Start Shopping"
          backgroundColor="bg-white"
          border="border border-white"
          color="text-black hover:text-white"
        />
      </motion.div>

      {/* Cards Section */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.25 } },
        }}
        className="grid grid-cols-1 md:grid-cols-3 container mx-auto px-4 sm:px-0 gap-4 sm:gap-10"
      >
        {dresserSteps.map((step, index) => (
          <motion.div
            key={index}
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
            }}
            className="flex flex-col items-start"
          >
            <motion.div
              className="w-full h-72 relative mb-6 overflow-hidden"
              initial={{ scale: 1.1, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              {/* Number Circle */}
              <div className="absolute bottom-3 left-3 w-10 h-10 rounded-full bg-black/50 border text-white flex items-center justify-center text-sm font-semibold z-20">
                <p className="text-[32px]">{index + 1}</p>
              </div>

              {/* Image */}
              <Image
                src={step.image}
                alt={step.title}
                fill
                className="object-cover"
              />
            </motion.div>

            <Header5 className="text-lg font-semibold mb-2">
              {step.title}
            </Header5>

            <Paragraph1 className="text-gray-300 text-sm">
              {step.description}
            </Paragraph1>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
