"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { missions } from "@/data/missionsData";
import { Header1, Header1Plus, Paragraph1 } from "@/common/ui/Text";

export default function OurMissionSection() {
  const [index, setIndex] = useState(0);

  // Auto-change every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % missions.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="w-full bg-black text-white py-28">
      <div className=" container mx-auto flex gap-4 flex-col md:flex-row items-start justify-between px-4 sm:px-0  space-y-4 md:space-y-0">
        {/* LEFT TEXT */}
        <div className="relative w-full md:pl-[200px] md:w-1/2 h-[260px] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="absolute"
            >
              <Paragraph1 className=" tracking-widest opacity-60 uppercase">
                Our Mission
              </Paragraph1>

              <Header1Plus className=" mt-3">
                {missions[index].title}
              </Header1Plus>

              <Paragraph1 className="  mt-3">
                {missions[index].description}
              </Paragraph1>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* RIGHT IMAGE */}
        <div className="relative w-full md:w-1/2 h-[450px] md:h-[550px] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={missions[index].image}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <Image
                src={missions[index].image}
                alt=""
                fill
                className="object-cover "
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
