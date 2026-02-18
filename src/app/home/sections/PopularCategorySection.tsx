// ENDPOINTS: GET /api/public/categories

"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Header1Plus, Header2, Paragraph1 } from "@/common/ui/Text";
import { useCategories } from "@/lib/queries/category/useCategories";
import { CategoryCardSkeleton } from "@/common/ui/SkeletonLoaders";

interface CategoryBoxProps {
  id: string;
  name: string;
  description: string;
  image: string;
  itemCount?: number;
}

const CategoryBox: React.FC<CategoryBoxProps> = ({
  id,
  name,
  description,
  image,
}) => {
  // Build URL with category filter
  const shopUrl = `/shop?category=${encodeURIComponent(name)}&title=${encodeURIComponent(name)}&description=${encodeURIComponent(description)}`;

  return (
    <Link
      href={shopUrl}
      className={`relative w-full group overflow-hidden cursor-pointer h-[200px] sm:h-auto`}
    >
      <div className="hidden sm:block" style={{ height: "280px" }}></div>

      {/* Background Image */}
      <Image
        src={image}
        alt={name}
        fill
        className="object-cover transition-transform duration-2000 ease-in-out group-hover:scale-110"
        priority
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent sm:opacity-0 transition-opacity duration-500 opacity-100 sm:group-hover:opacity-100" />

      {/* Text content */}
      <div className="absolute sm:bottom-[35px] bottom-4 left-4 sm:left-[34px] text-white z-10">
        <Header2 className="text-lg font-bold">{name}</Header2>
        <Paragraph1 className="text-sm hidden sm:flex">
          {description}
        </Paragraph1>
        <Link className=" hidden sm:block" href={shopUrl}>
          <button className="mt-2 py-1 text-white border-b font-semibold">
            <Paragraph1>Shop Now</Paragraph1>
          </button>
        </Link>
      </div>
    </Link>
  );
};

const PopularCategorySection = () => {
  const { data: categories, isLoading, error } = useCategories();

  if (isLoading) {
    return (
      <section className="container px-4 sm:px-0 mx-auto py-6 sm:py-12">
        <div className="text-center mb-6">
          <Header1Plus className="tracking-wide uppercase">
            Popular Categories
          </Header1Plus>
        </div>
        <CategoryCardSkeleton count={6} />
      </section>
    );
  }

  if (error) {
    return (
      <section className="container px-4 sm:px-0 mx-auto py-6 sm:py-12">
        <div className="text-center mb-6">
          <Header1Plus className="tracking-wide uppercase">
            Popular Categories
          </Header1Plus>
        </div>
        <CategoryCardSkeleton count={6} />
      </section>
    );
  }

  // Limit to 6 categories and split into 3 columns of 2 boxes each
  const displayCategories =
    (Array.isArray(categories) ? categories : [])?.slice(0, 6) || [];
  const columns = [
    displayCategories.slice(0, 2),
    displayCategories.slice(2, 4),
    displayCategories.slice(4, 6),
  ];

  return (
    <section className=" container px-4 sm:px-0 mx-auto py-6 sm:py-12">
      <div className="text-center mb-6">
        <Header1Plus className="tracking-wide uppercase">
          Popular Categories
        </Header1Plus>
        <Paragraph1 className="text-gray-600 ">
          Explore categories curated for every season, mood, and moment.{" "}
          <Link href="/style-spotlight" className="underline hover:opacity-80">
            view more
          </Link>
        </Paragraph1>
      </div>
      <div className="grid grid-cols-1  xl:grid-cols-3 gap-2 sm:gap-[23px]">
        {columns.map((col, colIndex) => (
          <div
            key={colIndex}
            className="flex flex-row xl:flex-col gap-2 sm:gap-[23px]"
          >
            {col.map((box) => (
              <CategoryBox key={box.id} {...box} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
};

export default PopularCategorySection;
