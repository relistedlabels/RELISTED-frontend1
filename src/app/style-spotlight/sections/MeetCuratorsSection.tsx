// ENDPOINTS: GET /api/public/users

"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Header1Plus, Header2, Paragraph1, Paragraph3 } from "@/common/ui/Text";

interface Curator {
  id: string;
  name: string;
  listings: number;
  image: string;
}

const CURATORS: Curator[] = [
  {
    id: "1",
    name: "Savannah Nguyen",
    listings: 100,
    image: "https://i.pravatar.cc/150?img=1",
  },
  {
    id: "2",
    name: "Jane Cooper",
    listings: 220,
    image: "https://i.pravatar.cc/150?img=5",
  },
  {
    id: "3",
    name: "Leslie Alexander",
    listings: 230,
    image: "https://i.pravatar.cc/150?img=12",
  },
  {
    id: "4",
    name: "Jacob Jones",
    listings: 230,
    image: "https://i.pravatar.cc/150?img=15",
  },
  {
    id: "5",
    name: "Ralph Edwards",
    listings: 230,
    image: "https://i.pravatar.cc/150?img=22",
  },
  {
    id: "6",
    name: "Devon Lane",
    listings: 230,
    image: "https://i.pravatar.cc/150?img=30",
  },
  {
    id: "7",
    name: "Arlene McCoy",
    listings: 230,
    image: "https://i.pravatar.cc/150?img=42",
  },
  {
    id: "8",
    name: "Arlene Foster",
    listings: 290,
    image: "https://i.pravatar.cc/150?img=60",
  },
];

export default function MeetCuratorsSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="container px-4 sm:px-0 mx-auto py-6 sm:py-16">
      {/* Carousel Section */}
      <div className="relative">
        <div className=" flex  justify-between items-center">
          <div className=" mb-8 sm:mb-12">
            <Header1Plus className="tracking-wide uppercase">
              Meet Our Listers
            </Header1Plus>
            <Paragraph1 className="text-gray-600 mt-2">
              Style leaders sharing their unique perspectives
            </Paragraph1>
          </div>

          <div className=" flex gap-4 items-center">
            {" "}
            <button
              onClick={() => scroll("left")}
              className=" bg-white rounded-full p-2 border shadow-lg hover:shadow-xl transition-shadow z-10 hidden sm:flex items-center justify-center"
            >
              <ChevronLeft size={24} className="text-gray-800" />
            </button>
            <button
              onClick={() => scroll("right")}
              className=" bg-white rounded-full p-2 shadow-lg border hover:shadow-xl transition-shadow z-10 hidden sm:flex items-center justify-center"
            >
              <ChevronRight size={24} className="text-gray-800" />
            </button>
          </div>
        </div>

        {/* Scroll Container */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="overflow-x-auto hide-scrollbar scrollbar-hide"
          style={{ scrollBehavior: "smooth" }}
        >
          <div className="flex gap-6 sm:gap-8 pb-4 px-4 sm:px-0">
            {CURATORS.map((curator) => (
              <Link key={curator.id} href={`/lister-profile/${curator.id}`}>
                <div className="flex-shrink-0 flex flex-col items-center group cursor-pointer">
                  {/* Circular Image */}
                  <div className="relative w-22 h-22 sm:w-32 sm:h-32 mb-4 rounded-full overflow-hidden border-4 border-red-400 hover:border-red-500 transition-all duration-300">
                    <Image
                      src={curator.image}
                      alt={curator.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      sizes="(max-width: 640px) 100px, 100px"
                    />
                  </div>

                  {/* Curator Info */}
                  <Paragraph3 className="text-center text-sm sm:text-base font-semibold text-gray-900 mb-1">
                    {curator.name}
                  </Paragraph3>
                  <Paragraph1 className="text-center text-xs sm:text-sm text-gray-600">
                    {curator.listings} Listings
                  </Paragraph1>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div></div>
      </div>
    </section>
  );
}
