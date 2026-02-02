"use client";

import { Header1Plus, Paragraph1 } from "@/common/ui/Text";
import Image from "next/image";

export default function AboutUsSection() {
  return (
    <section className=" pt-[85px] sm:pt-[100px] px-4 md:px-0  py-12 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 container mx-auto items-center">
        {" "}
        {/* Image (on mobile this becomes second) */}
        <div className="order-2 md:order-1 w-full">
          <div className="relative w-full h-[400px] md:h-screen">
            <Image
              src="/images/abbouthero.png"
              alt="About Us"
              fill
              className="object-cover "
            />
          </div>
        </div>
        {/* Text (on mobile this becomes first) */}
        <div className="order-1 md:order-2 w-full pb-8 sm:pb-0 md:pl-12">
          <Paragraph1 className="text-sm text-gray-500 mb-2">
            ABOUT US
          </Paragraph1>

          <Header1Plus className="text-3xl md:text-4xl font-semibold mb-6">
            FROM NIGERIA, TO THE WORLD
          </Header1Plus>

          <Paragraph1 className="mb-4">
            Born in Nigeria, Relisted embodies the elegance, craftsmanship, and
            heritage of its namesake city. Inspired by the rich culture and
            timeless style of Asia and Europe, we bring fashion that transcends
            borders, designed to be cherished across the world.
          </Paragraph1>

          <Paragraph1>
            From the historic streets of Relisted to global runways, our designs
            reflect a legacy of artistry and sophistication. Rooted in quality
            and refined aesthetics, we create pieces that honor tradition while
            embracing the future because true style knows no boundaries.
          </Paragraph1>
        </div>
      </div>
    </section>
  );
}
