// ENDPOINTS: GET /api/public/categories

"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Header1Plus, Header2, Paragraph1, Paragraph2 } from "@/common/ui/Text";
import { useCategories } from "@/lib/queries/category/useCategories";
import { CategoryCardSkeleton } from "@/common/ui/SkeletonLoaders";

interface CategoryBoxProps {
  id: string;
  name: string;
  description?: string;
  image?: string;
  itemCount?: number;
}

const CategoryBox: React.FC<CategoryBoxProps> = ({
  id,
  name,
  description = "Explore this collection",
  image = "/images/placeholder.jpg",
}) => {
  // Build URL with category filter
  const shopUrl = `/shop?category=${encodeURIComponent(name)}&title=${encodeURIComponent(name)}&description=${encodeURIComponent(description)}`;

  return (
    <Link
      href={shopUrl}
      className={`relative w-full group overflow-hidden cursor-pointer h-[160px] sm:h-full`}
    >
      <div className="hidden sm:block" style={{ height: "320px" }}></div>

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
        <Paragraph2 className="text-lg font-bold">{name}</Paragraph2>
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
        <CategoryCardSkeleton count={4} />
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
        <CategoryCardSkeleton count={4} />
      </section>
    );
  }

  // Limit to 4 categories
  const displayCategories =
    (Array.isArray(categories) ? categories : [])?.slice(0, 4) || [];

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
      <div className="grid grid-cols-2 xl:grid-cols-2 xl:auto-rows-[320px] gap-2 sm:gap-[20px]">
        {displayCategories.map((box, index) => (
          <div
            key={box.id}
            className={index === 0 || index === 3 ? "xl:row-span-2" : ""}
          >
            <CategoryBox {...box} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default PopularCategorySection;
