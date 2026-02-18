// ENDPOINTS: GET /api/public/categories

"use client";

import React from "react";
import Link from "next/link";
import { Header1Plus, Header2, Paragraph1 } from "@/common/ui/Text";
import { useCategories } from "@/lib/queries/category/useCategories";
import { CategoryCardSkeleton } from "@/common/ui/SkeletonLoaders";
import Image from "next/image";

export default function StyleCategoriesSection() {
  const { data: categories, isLoading, error } = useCategories();

  if (isLoading) {
    return (
      <section className="container px-4 sm:px-0 mx-auto py-6 sm:py-12">
        <div className="text-center mb-6 sm:mb-12">
          <Header1Plus className="tracking-wide uppercase">
            Style Categories
          </Header1Plus>
        </div>
        <CategoryCardSkeleton count={6} />
      </section>
    );
  }

  if (error) {
    return (
      <section className="container px-4 sm:px-0 mx-auto py-6 sm:py-12">
        <div className="text-center mb-6 sm:mb-12">
          <Header1Plus className="tracking-wide uppercase">
            Style Categories
          </Header1Plus>
        </div>
        <CategoryCardSkeleton count={6} />
      </section>
    );
  }

  return (
    <section className="container px-4 sm:px-0 mx-auto py-6 sm:py-12">
      <div className="text-center mb-6 sm:mb-12">
        <Header1Plus className="tracking-wide uppercase">
          Style Categories
        </Header1Plus>
        <Paragraph1 className="text-gray-600 mt-2">
          Explore all our curated collections
        </Paragraph1>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {(Array.isArray(categories) ? categories : []).map((category, idx) => {
          const shopUrl = `/shop?category=${encodeURIComponent(category.name)}&title=${encodeURIComponent(category.name)}&description=${encodeURIComponent(category.description)}`;

          return (
            <Link key={category.id} href={shopUrl}>
              <div className="relative w-full h-[250px] sm:h-[300px] group overflow-hidden rounded-lg cursor-pointer">
                {/* Background Image */}
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-2000 ease-in-out group-hover:scale-110"
                  priority={idx < 3}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent group-hover:from-black/80 transition-all duration-300" />

                {/* Text Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 text-white">
                  <Header2 className="text-lg sm:text-xl font-bold mb-2">
                    {category.name}
                  </Header2>
                  <Paragraph1 className="text-sm line-clamp-2 opacity-90 group-hover:opacity-100 transition-opacity">
                    {category.description}
                  </Paragraph1>
                  <button className="mt-3 text-sm font-semibold border-b-2 border-white w-fit hover:border-gray-300 transition-colors">
                    <Paragraph1>Explore</Paragraph1>
                  </button>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
