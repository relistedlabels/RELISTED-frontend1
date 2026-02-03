"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Header1Plus, Header2, Paragraph1 } from "@/common/ui/Text";
import { categories, Category } from "@/data/categoryData"; // import data

interface CategoryBoxProps extends Category {}

const CategoryBox: React.FC<CategoryBoxProps> = ({
  image,
  title,
  description,
  link,
  height,
  filterType,
  filterValue,
}) => {
  // Build URL with filters if available
  const shopUrl =
    filterType && filterValue
      ? `/shop?${filterType}=${encodeURIComponent(filterValue)}&title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`
      : link;

  return (
    <div
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
        <Header2 className="text-lg font-bold">{title}</Header2>
        <Paragraph1 className="text-sm hidden sm:flex">
          {description}
        </Paragraph1>
        <Link className=" hidden sm:block" href={shopUrl}>
          <button className="mt-2 py-1 text-white border-b font-semibold">
            <Paragraph1>Shop Now</Paragraph1>
          </button>
        </Link>
      </div>
    </div>
  );
};

const PopularCategorySection = () => {
  // Split into 3 columns of 2 boxes each
  const columns = [
    categories.slice(0, 2),
    categories.slice(2, 4),
    categories.slice(4, 6),
  ];

  return (
    <section className=" container px-4 sm:px-0 mx-auto py-6 sm:py-12">
      <div className="text-center mb-6">
        <Header1Plus className="tracking-wide uppercase">
          Popular Categories
        </Header1Plus>
        <Paragraph1 className="text-gray-600 ">
          Explore categories curated for every season, mood, and moment.
        </Paragraph1>
      </div>
      <div className="grid grid-cols-1  xl:grid-cols-3 gap-2 sm:gap-[23px]">
        {columns.map((col, colIndex) => (
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
