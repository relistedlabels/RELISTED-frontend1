"use client";

import React from "react";
import { Header1Plus, Paragraph1 } from "@/common/ui/Text";
import { useTags } from "@/lib/queries/tag/useTags";
import Link from "next/link";

const TagCard: React.FC<{ name: string }> = ({ name }) => {
  return (
    <Link
      href={`/shop?tags=${encodeURIComponent(name)}`}
      className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 p-6 text-center transition-all duration-300 hover:shadow-lg hover:from-black hover:to-gray-900"
    >
      <Paragraph1 className="font-semibold text-gray-800 group-hover:text-white transition-colors duration-300">
        {name}
      </Paragraph1>
    </Link>
  );
};

const TagsGridSection = () => {
  const { data: tags, isPending: isLoading, isError } = useTags();

  if (isLoading) {
    return (
      <section className="py-12 sm:py-16 px-4 sm:px-0 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <Header1Plus className="tracking-wide uppercase">
              for your special events 
            </Header1Plus>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-pulse">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (isError || !tags) {
    return (
      <section className="py-12 sm:py-16 px-4 sm:px-0 bg-white">
        <div className="container mx-auto">
          <div className="text-center">
            <Header1Plus className="tracking-wide uppercase">
              for your special events
            </Header1Plus>
            <Paragraph1 className="text-gray-600 mt-4">
              Unable to load tags at this time
            </Paragraph1>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-0 bg-white">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <Header1Plus className="tracking-wide uppercase">
            for your special events
          </Header1Plus>
          <Paragraph1 className="text-gray-600 max-w-[280px] sm:max-w-[480px] mt-2">
            Explore products by style, occasion, and mood
          </Paragraph1>
        </div>

        {/* Tags Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {tags.map((tag) => (
            <TagCard key={tag.id} name={tag.name} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TagsGridSection;
