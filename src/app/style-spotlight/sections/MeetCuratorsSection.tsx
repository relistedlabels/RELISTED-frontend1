// ENDPOINTS: GET /api/public/users

"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Header1Plus, Header2, Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { useUsers } from "@/lib/queries/user/useUsers";
import { UserCardSkeleton } from "@/common/ui/SkeletonLoaders";

export default function MeetCuratorsSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const {
    data: users,
    isLoading,
    error,
  } = useUsers({
    limit: 20,
    role: "lister",
  });

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

  if (isLoading) {
    return (
      <section className="container px-4 sm:px-0 mx-auto py-6 sm:py-16">
        <div className="mb-8 sm:mb-12">
          <Header1Plus className="tracking-wide uppercase">
            Meet Our Listers
          </Header1Plus>
        </div>
        <UserCardSkeleton count={4} />
      </section>
    );
  }

  if (error) {
    return (
      <section className="container px-4 sm:px-0 mx-auto py-6 sm:py-16">
        <div className="mb-8 sm:mb-12">
          <Header1Plus className="tracking-wide uppercase">
            Meet Our Listers
          </Header1Plus>
        </div>
        <UserCardSkeleton count={4} />
      </section>
    );
  }

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
            {users?.map((user) => (
              <Link key={user.id} href={`/lister-profile/${user.id}`}>
                <div className="flex-shrink-0 flex flex-col items-center group cursor-pointer">
                  {/* Circular Image */}
                  <div className="relative w-22 h-22 sm:w-32 sm:h-32 mb-4 rounded-full overflow-hidden border-4 border-red-400 hover:border-red-500 transition-all duration-300">
                    <Image
                      src={user.avatar || "/images/default-avatar.png"}
                      alt={user.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      sizes="(max-width: 640px) 100px, 100px"
                    />
                  </div>

                  {/* Curator Info */}
                  <Paragraph3 className="text-center text-sm sm:text-base font-semibold text-gray-900 mb-1">
                    {user.name}
                  </Paragraph3>
                  <Paragraph1 className="text-center text-xs sm:text-sm text-gray-600">
                    {user.itemCount} Listings
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
