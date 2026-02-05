"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Header4, Header1Plus, Paragraph1 } from "@/common/ui/Text";

export default function BecomeCuratorSection() {
  const benefits = [
    "Share your unique style with a community of fashion lovers",
    "Earn effortlessly every time your pieces are rented",
    "Build your personal brand and grow your following",
  ];

  return (
    <section className="relative w-full bg-black text-white py-8 sm:py-16">
      <div className="container mx-auto px-4 sm:px-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center">
          {/* Left Side - Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative w-full h-[300px] sm:h-[500px] rounded-lg overflow-hidden"
          >
            <Image
              src="/images/crotbg.jpg"
              alt="Become a Curator"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </motion.div>

          {/* Right Side - Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* Label */}
            <Header4 className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-gray-400">
              Join Our Community
            </Header4>

            {/* Heading */}
            <Header1Plus className="text-4xl sm:text-5xl font-bold leading-tight">
              Become a Lister
            </Header1Plus>

            {/* Description */}
            <Paragraph1 className="text-sm sm:text-base text-gray-300 leading-relaxed">
              Join the movement redefining how luxury fashion is shared. Turn
              your wardrobe into a source of inspiration and income.
            </Paragraph1>

            {/* Benefits List */}
            <div className="space-y-4 py-4">
              {benefits.map((benefit, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-3"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white flex items-center justify-center mt-0.5">
                    <Check size={16} className="text-black" />
                  </div>
                  <Paragraph1 className="text-sm sm:text-base text-gray-200">
                    {benefit}
                  </Paragraph1>
                </motion.div>
              ))}
            </div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="pt-4"
            >
              <Link href="/auth/sign-up">
                <button className="px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-300 text-sm sm:text-base">
                  Become a Curator
                </button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
