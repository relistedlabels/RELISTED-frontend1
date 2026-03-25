"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { faqs } from "@/data/faqsData";
import { Header1Plus, Paragraph1 } from "@/common/ui/Text";

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Display first 10 FAQs or all FAQs based on showAll state
  const displayedFaqs = showAll ? faqs : faqs.slice(0, 10);
  const hasMore = faqs.length > 10;

  return (
    <section className="w-full max-w-4xl mx-auto py-20 px-6">
      {/* Title */}
      <Header1Plus className="text-center text-3xl font-semibold tracking-wide mb-14">
        FAQ
      </Header1Plus>

      {/* FAQ list */}
      <div className="space-y-0 border-t border-black/10">
        {displayedFaqs.map((faq, index) => {
          const isOpen = openIndex === index;

          return (
            <div key={index} className="border-b border-black/10">
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex justify-between items-center py-6 text-left"
              >
                <span className="text-[15px] font-light tracking-wide">
                  <Paragraph1> {faq.question}</Paragraph1>
                </span>

                {isOpen ? (
                  <Minus size={20} strokeWidth={1.5} />
                ) : (
                  <Plus size={20} strokeWidth={1.5} />
                )}
              </button>

              {/* Soft animated answer */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{
                      duration: 0.35,
                      ease: [0.21, 0.47, 0.32, 0.98], // Gentle easing
                    }}
                    className="overflow-hidden"
                  >
                    <Paragraph1 className="pb-6  text-black/70 leading-relaxed max-w-[90%]">
                      {faq.answer}
                    </Paragraph1>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Show More Button */}
      {hasMore && (
        <div className="flex justify-center mt-10">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-8 py-3 border border-black font-semibold transition-all hover:bg-black hover:text-white"
          >
            <Paragraph1>{showAll ? "Show Less" : "Show More"}</Paragraph1>
          </button>
        </div>
      )}
    </section>
  );
}
