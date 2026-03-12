"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Header1Plus, Header2, HeaderAny, Paragraph1 } from "@/common/ui/Text";
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
      className={`relative w-full group overflow-hidden cursor-pointer h-[200px] sm:h-auto`}
      style={{ height: undefined, ...(height && { ["--h"]: height }) }}
    >
      <div className="hidden sm:block" style={{ height }}></div>

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
        <HeaderAny className="text-lg font-bold">{title}</HeaderAny>
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
  // Mobile: 2 columns of 2 boxes = 4 categories
  const mobileColumns = [categories.slice(0, 2), categories.slice(2, 4)];

  // Desktop: 3 columns of 2 boxes = 6 categories
  const desktopColumns = [
    categories.slice(0, 2),
    categories.slice(2, 4),
    categories.slice(4, 6),
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

      {/* Mobile layout - 2 columns, 4 categories */}
      <div className="grid grid-cols-1 sm:hidden gap-2">
        {mobileColumns.map((col, colIndex) => (
          <div key={colIndex} className="flex flex-row gap-2">
            {col.map((box, idx) => (
              <CategoryBox key={idx} {...box} />
            ))}
          </div>
        ))}
      </div>

      {/* Desktop layout - 3 columns, 6 categories */}
      <div className="hidden sm:grid grid-cols-1 xl:grid-cols-3 gap-2 sm:gap-[23px]">
        {desktopColumns.map((col, colIndex) => (
          <div
            key={colIndex}
            className="flex flex-row xl:flex-col gap-2 sm:gap-[23px]"
          >
            {col.map((box, idx) => (
              <CategoryBox key={idx} {...box} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
};

export default PopularCategorySection;
