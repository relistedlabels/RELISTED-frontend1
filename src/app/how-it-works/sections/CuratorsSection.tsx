"use client";

import Image from "next/image";
import { Header1Plus, Header5, Paragraph1 } from "@/common/ui/Text";
import Button from "@/common/ui/Button";
import { curatorSteps } from "@/data/curatorSteps";
import { motion } from "framer-motion";

export default function CuratorsSection() {
  return (
    <section className="w-full bg-[#3A3A32] text-white py-20">
      {/* Top Content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
        className="text-center flex flex-col items-center max-w-3xl px-4 mx-auto mb-16"
      >
        <Paragraph1 className="tracking-widest text-sm">CURATORS</Paragraph1>
        <hr className="mb-8 w-full" />

        <Header1Plus className="mb-6">
          TURN YOUR CLOSET
          <br />
          INTO A STREAM OF INCOME.
        </Header1Plus>

        <Paragraph1 className="text-gray-300 mb-8 text-sm md:text-base">
          Share your best pieces, earn from every rental, and join a community
          redefining how fashion is experienced and valued.
        </Paragraph1>

        <Button
          text="Become a Curator"
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
        className="grid grid-cols-1 md:grid-cols-3 container mx-auto px-4 sm:px-0 sm:gap-10 gap-4"
      >
        {curatorSteps.map((step, index) => (
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
