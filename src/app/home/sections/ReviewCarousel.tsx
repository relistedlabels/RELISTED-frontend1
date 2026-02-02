"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import {
  Header1Plus,
  Paragraph1,
  Paragraph2,
  Paragraph3,
  ParagraphAny,
} from "@/common/ui/Text";
import { reviews } from "@/data/reviewsData";

interface Review {
  id: number;
  name: string;
  role: string;
  text: string;
  img: string;
}

export default function ReviewCarousel() {
  const [index, setIndex] = useState(0);

  const prev = () => {
    setIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
  };

  const next = () => {
    setIndex((prev) => (prev === reviews.length - 1 ? 0 : prev + 1));
  };

  const leftIndex = (index - 1 + reviews.length) % reviews.length;
  const rightIndex = (index + 1) % reviews.length;

  return (
    <div className="w-full flex flex-col items-center py-6 sm:py-12 px-4 sm:px-0 bg-white">
      {/* Heading */}
      <div className="text-center sm:mb-10">
        <Header1Plus className=" ">Join 100,000+ Happy Members</Header1Plus>

        <div className=" flex justify-center text-[24px]  gap-2 items-center text-black text-xl">
          <p className="font-bold pr-2">5.0</p>
          ★★★★★
        </div>

        <Paragraph1 className="text-gray-500 mt-1">
          Based on 10,000+ Google Reviews
        </Paragraph1>
      </div>

      {/* Cards Container */}
      <div className="relative w-full container mx-auto h-[260px] flex items-center justify-center">
        {/* LEFT SMALL CARD */}
        <AnimatePresence initial={false}>
          <motion.div
            key={leftIndex}
            initial={{ scale: 0.85, x: -250, opacity: 0 }}
            animate={{ scale: 0.85, x: -200, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute bg-white rounded-xl shadow-[0_4px_35px_rgba(0,0,0,0.15)] p-[38px] sm:w-[680px] w-full sm:h-[221px]"
          >
            <SmallReviewCard review={reviews[leftIndex]} />
          </motion.div>
        </AnimatePresence>

        {/* CENTER MAIN CARD */}
        <AnimatePresence initial={false}>
          <motion.div
            key={index}
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute bg-white rounded-xl shadow-[0_4px_35px_rgba(0,0,0,0.15)] p-4 sm:p-[51px] sm:w-[748px] w-full sm:h-[300px] z-20"
          >
            <MainReviewCard review={reviews[index]} />
          </motion.div>
        </AnimatePresence>

        {/* RIGHT SMALL CARD */}
        <AnimatePresence initial={false}>
          <motion.div
            key={rightIndex}
            initial={{ scale: 0.85, x: 250, opacity: 0 }}
            animate={{ scale: 0.85, x: 200, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute bg-white rounded-xl shadow-[0_4px_35px_rgba(0,0,0,0.15)] p-[38px] sm:w-[680px] w-full sm:h-[221px]"
          >
            <SmallReviewCard review={reviews[rightIndex]} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* NAV BUTTONS */}
      <div className="flex gap-4 mt-6 sm:mt-[43px] ">
        <button
          onClick={prev}
          className="w-10 h-10 rounded-full  shadow-lg flex items-center justify-center hover:bg-gray-100 transition"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={next}
          className="w-10 h-10 rounded-full shadow-lg  flex items-center justify-center hover:bg-gray-100 transition"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

// Small card used for left & right
function SmallReviewCard({ review }: { review: Review }) {
  return (
    <div>
      <div className=" flex gap-2 sm:gap-4">
        <Image
          src={review.img}
          alt={review.name}
          width={100}
          height={100}
          className="rounded-lg sm:w-[200px] sm:h-[150px] object-cover"
        />
        <div>
          <ParagraphAny className="text-gray-700 text-[12px] leading-relaxed sm:mb-3 ">
            {review.text}
          </ParagraphAny>
          <div className="text-[#FCA120] my-2 sm:my-5 text-[12px]  ">
            ★★★★★
          </div>
          <div className=" border-t pt-[11px] w-[fit]">
            <p className=" text-[12px] font-semibold ">{review.name}</p>
            <p className="text-[12px] text-gray-500">{review.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main center card
function MainReviewCard({ review }: { review: Review }) {
  return (
    <div>
      <div className=" flex gap-2 sm:gap-4">
        <Image
          src={review.img}
          alt={review.name}
          width={100}
          height={100}
          className="rounded-lg sm:w-[200px] sm:h-[200px] object-cover"
        />
        <div>
          <ParagraphAny className="text-gray-700 text-[12px] sm:text-[14px] leading-relaxed sm:mb-3 ">
            {review.text}
          </ParagraphAny>
          <div className="text-[#FCA120] my-2 sm:my-5 text-[12px] sm:text-[24px] ">
            ★★★★★
          </div>
          <div className=" border-t pt-[11px] w-[fit]">
            <Paragraph3 className="font-semibold ">{review.name}</Paragraph3>
            <Paragraph1 className=" text-gray-500">{review.role}</Paragraph1>
          </div>
        </div>
      </div>
    </div>
  );
}
