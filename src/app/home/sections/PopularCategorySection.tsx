"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Header1Plus, Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { categories } from "@/data/categoryData";

const PopularCategorySection = () => {
  const displayCategories = categories.slice(0, 4);

  return (
    <section className="container px-3 sm:px-4 md:px-6 lg:px-0 mx-auto py-6 sm:py-12">
      {/* Header */}
      <div className="text-center flex flex-col items-center mb-8">
        <Header1Plus className="tracking-wide uppercase">
          Popular Categories
        </Header1Plus>
        <Paragraph1 className="text-gray-600 max-w-[280px] mt-2">
          Explore categories curated for every season, mood, and moment.
        </Paragraph1>
        <Link
          href="/style-spotlight"
          className="mt-4 text-sm font-bold border-b hover:opacity-70 transition-opacity"
        >
          Browse All →
        </Link>
      </div>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-4 ">
        {displayCategories.map((category, idx) => (
          <Link
            key={idx}
            href={category.link}
            className="group relative overflow-hidden  h-48 sm:h-[500px]"
          >
            {/* Image */}
            <Image
              src={category.image}
              alt={category.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              priority={idx < 2}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
              <Paragraph3 className="text-lg sm:text-xl font-bold">
                {category.title}
              </Paragraph3>
              <Paragraph1 className="text-sm sm:block hidden mt-1 opacity-90">
                {category.description}
              </Paragraph1>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default PopularCategorySection;
