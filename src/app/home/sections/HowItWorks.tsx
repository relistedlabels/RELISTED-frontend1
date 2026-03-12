import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  Header1,
  Header1Plus,
  Header2,
  HeaderAny,
  Paragraph2,
  Paragraph3,
  ParagraphAny,
} from "@/common/ui/Text";

function HowItWorks() {
  return (
    <section
      className="w-full   bg-black py-12 md:py-20 bg-cover bg-center relative"
      style={{ backgroundImage: "url('/images/delivery1.png')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black-/60"></div>
      <div className=" sm:max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center sm:gap-8">
          <img
            src="/icons/Box.svg"
            alt="Delivery"
            className="w-[54px] h-[54px] sm:w-[84px] sm:h-[84px] object-contain"
          />

          {/* Text Content */}
          <div className="flex flex-col sm:space-y-2 space-y-2-  max-w-[400px] sm:max-w-4xl">
            <HeaderAny className="text-white text-[28px] sm:text-[32px]">
              Delivered as soon as... today
            </HeaderAny>

            <div className="sm:space-y-4 mb-[18px]">
              <Paragraph3 className=" text-gray-300">
                Same day delivery for items near you, or from anywhere in Lagos
              </Paragraph3>
            </div>

            <Link
              href="/how-it-works#delivery"
              className="inline-flex justify-center items-center gap-2 text-white gray-400 hover:text-white font-semibold text-lg transition-colors group mx-auto"
            >
              <ParagraphAny className="text-[14px] md:text-xl border-b border-gray-300 font-semibold ">
                Learn More About Delivery
              </ParagraphAny>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
