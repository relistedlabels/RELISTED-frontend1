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
          <Header1Plus className="text-3xl md:text-4xl font-semibold mb-6">
            Our Story
          </Header1Plus>

          <Paragraph1 className="mb-4">
            Relisted Labels began with a simple observation: wardrobes are full
            of incredible pieces that rarely get worn, while people are
            constantly searching for the perfect outfit for their next occasion.
          </Paragraph1>

          <Paragraph1 className="mb-4">
            We saw an opportunity to rethink the way fashion is experienced,
            creating a platform where individuals can earn from pieces in their
            closets while others gain access to premium styles without the full
            retail commitment.
          </Paragraph1>

          <Paragraph1 className="mb-4">
            Fashion today moves faster than ever. Trends evolve quickly,
            designer prices continue to rise, and many outfits are purchased for
            moments that only happen once. Relisted Labels exists to make
            premium fashion more accessible while giving great pieces a longer
            life. By connecting people who want access to standout fashion with
            those who already own it, we keep style in motion.
          </Paragraph1>

          <Paragraph1 className="mb-4">
            Today, we're building a community that believes fashion should be
            accessible, flexible, and circular, opening the door for more people
            to enjoy designer fashion while turning underused wardrobes into
            opportunity.
          </Paragraph1>

          <Header1Plus className="text-2xl md:text-3xl font-semibold mb-4 mt-6">
            Join the Fashion Revolution
          </Header1Plus>

          <Paragraph1>
            Whether you're looking for the perfect outfit or earn money from
            your closet, Relisted makes it easy.
          </Paragraph1>
        </div>
      </div>
    </section>
  );
}
