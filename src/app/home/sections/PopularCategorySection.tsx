"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Header1Plus,
  Header2,
  HeaderAny,
  Paragraph1,
  Paragraph2,
  Paragraph3,
} from "@/common/ui/Text";
import { categories, Category } from "@/data/categoryData"; // import data

interface CategoryBoxProps extends Category {}

const CategoryBox: React.FC<CategoryBoxProps> = ({
  image,
  title,
  description,
  link,
  height,
}) => {
  return (
    <Link
      href={link}
      className={`relative w-full group overflow-hidden cursor-pointer h-[220px] sm:h-full`}
    >
      <div
        className="hidden sm:block"
        style={{ height: height || "280px" }}
      ></div>

      {/* Background Image */}
      <Image
        src={image}
        alt={title}
        fill
        className="object-cover transition-transform duration-2000 ease-in-out group-hover:scale-110"
        priority
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent sm:opacity-0 transition-opacity duration-500 opacity-100 sm:group-hover:opacity-100" />

      {/* Text content */}
      <div className="absolute sm:bottom-[35px] bottom-4 left-4 sm:left-[34px] text-white z-10">
        <Paragraph3 className="text-lg font-bold">{title}</Paragraph3>
        <Paragraph1 className="text-sm hidden sm:flex">
          {description}
        </Paragraph1>
        <div className=" hidden sm:block">
          <button className="mt-2 py-1 text-white border-b font-semibold">
            <Paragraph1>Shop Now</Paragraph1>
          </button>
        </div>
      </div>
    </Link>
  );
};

const PopularCategorySection = () => {
  // Limit to 4 categories
  const displayCategories = categories.slice(0, 4);

  // Mobile: 2x2 grid
  const mobileColumns = [
    displayCategories.slice(0, 2),
    displayCategories.slice(2, 4),
  ];

  return (
    <section className=" container px-4 sm:px-0 mx-auto py-6 sm:py-12">
      <div className="text-center flex flex-col items-center mb-6">
        <Header1Plus className="tracking-wide uppercase">
          Popular Categories
        </Header1Plus>
        <Paragraph1 className="text-gray-600 max-w-[280px] ">
          Explore categories curated for every season, mood, and moment.
        </Paragraph1>
        <div className="flex justify-center mt-[16px]">
          <Link
            href="/style-spotlight"
            className="text-center text-[14px] font-bold border-b hover:opacity-70 transition-opacity"
          >
            <Paragraph1>Browse All → </Paragraph1>
          </Link>
        </div>
      </div>

      {/* Mobile layout - 2x2 grid, 4 categories */}
      <div className="grid grid-cols-1 sm:hidden gap-2">
        {mobileColumns.map((col, colIndex) => (
          <div key={colIndex} className="flex flex-row gap-2">
            {col.map((box, idx) => (
              <CategoryBox key={idx} {...box} />
            ))}
          </div>
        ))}
      </div>

      {/* Desktop layout - Masonry 2x2, 4 categories with heights from data */}
      <div className="hidden sm:grid grid-cols-2 gap-2 sm:gap-[23px]">
        {displayCategories.map((box, idx) => (
          <div
            key={idx}
            className="overflow-hidden"
            style={{ height: box.height || "280px" }}
          >
            <CategoryBox {...box} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default PopularCategorySection;
