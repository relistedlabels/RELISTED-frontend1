import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  Header1,
  Header1Plus,
  Header2,
  Paragraph2,
  Paragraph3,
} from "@/common/ui/Text";

function HowItWorks() {
  return (
    <section
      className="w-full bg-black py-12 md:py-20 bg-cover bg-center relative"
      style={{ backgroundImage: "url('/images/delivery1.png')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black-/60"></div>
      <div className=" sm:max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center gap-8">
          <img
            src="/icons/Box.svg"
            alt="Delivery"
            className="w-24 h-24 object-contain"
          />

          {/* Text Content */}
          <div className="flex flex-col space-y-6  max-w-[400px] sm:max-w-4xl">
            <Header1 className="text-white">
              Delivered as soon as... today
            </Header1>

            <div className="space-y-4">
              <Paragraph3 className=" text-gray-300">
                Same day delivery for items near you, or from anywhere in Lagos
              </Paragraph3>
            </div>

            <Link
              href="/how-it-works#delivery"
              className="inline-flex justify-center items-center gap-2 text-white gray-400 hover:text-white font-semibold text-lg transition-colors group mx-auto"
            >
              <Paragraph2 className="text-xl md:text-2xl font-semibold ">
                Learn More About Delivery
              </Paragraph2>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
