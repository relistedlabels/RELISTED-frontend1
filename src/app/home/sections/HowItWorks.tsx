import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Header1, Header1Plus, Paragraph2 } from "@/common/ui/Text";

function HowItWorks() {
  return (
    <section className="w-full bg-black py-12 md:py-20 ">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center items-center">
          {/* Left side - Text Content */}
          <div className="flex flex-col space-y-6">
            <Header1 className=" text-white">
              Delivered as soon as... today
            </Header1>

            <div className="space-y-4">
              <Paragraph2 className="text-lg text-gray-300 ">
                Same day delivery for items near you, or from
                anywhere in Lagos
              </Paragraph2>

              <Paragraph2 className="text-xl md:text-2xl font-semibold text-gray-300">
                The Fastest Way to Wear The Trend
              </Paragraph2>
            </div>

            <Link
              href="/how-it-works"
              className="flex justify-center text-center items-center gap-2 text-gray-600 hover:text-white font-semibold text-lg transition-colors group"
            >
              Learn More About Delivery
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
