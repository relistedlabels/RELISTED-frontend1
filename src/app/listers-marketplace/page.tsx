// ENDPOINTS: GET /api/public/users

"use client";

import React, { useState } from "react";
import { Header1Plus, Header2, Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { useUsers } from "@/lib/queries/user/useUsers";
import { UserCardSkeleton } from "@/common/ui/SkeletonLoaders";
import Link from "next/link";
import Image from "next/image";

export default function AllListersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading, error } = useUsers({
    role: "lister",
    page: currentPage,
    limit: 20,
  });
  const [searchTerm, setSearchTerm] = useState("");

  const users = data?.users || [];
  const pagination = data?.pagination;

  // Check if running on localhost
  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.startsWith("localhost:"));

  // Filter out test user on production
  const HIDDEN_USER_ID = "7d172d18-daad-46cd-ab6d-8d8af28c0b16";
  const visibleUsers =
    users?.filter((user) => {
      if (!isLocalhost && user.id === HIDDEN_USER_ID) {
        return false;
      }
      return true;
    }) || [];

  // ✅ Filter and sort: show users with avatars first, then the rest
  const filteredUsers = visibleUsers
    .filter((user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      // Users with avatars come first
      if (a.avatar && !b.avatar) return -1;
      if (!a.avatar && b.avatar) return 1;
      return 0;
    });

  if (isLoading) {
    return (
      <div className="w-full bg-white">
        <section className="w-full bg-black text-white py-12 sm:py-20 px-4 sm:px-0">
          <div className="container mx-auto">
            <Header1Plus className="text-3xl sm:text-4xl tracking-wide uppercase mb-4">
              All Listers
            </Header1Plus>
            <Paragraph1 className="text-gray-300">
              Explore all listers on the RELISTED platform
            </Paragraph1>
          </div>
        </section>
        <section className="w-full py-12 sm:py-20 px-4 sm:px-0">
          <div className="container mx-auto text-center">
            <Paragraph1 className="text-gray-500">
              Loading listers...
            </Paragraph1>
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-white">
        <section className="w-full bg-black text-white py-12 pt-[150px] sm:py-20 px-4 sm:px-0">
          <div className="container mx-auto">
            <Header1Plus className="text-3xl sm:text-4xl tracking-wide uppercase mb-4">
              All Listers
            </Header1Plus>
            <Paragraph1 className="text-gray-300">
              Explore all listers on the RELISTED platform
            </Paragraph1>
          </div>
        </section>
        <section className="w-full py-12 sm:py-20 px-4 sm:px-0">
          <div className="container mx-auto text-center">
            <Paragraph1 className="text-gray-500">
              Failed to load listers. Please try again later.
            </Paragraph1>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="w-full bg-white">
      {/* Hero Section */}
      <section className="w-full bg-black text-white py-12 pt-[100px] sm:py-20 px-4 sm:px-0">
        <div className="container mx-auto">
          <Header1Plus className="text-3xl sm:text-4xl tracking-wide uppercase mb-4">
            All Listers
          </Header1Plus>
          <Paragraph1 className="text-gray-300">
            Explore all listers on the RELISTED platform
          </Paragraph1>
        </div>
      </section>

      {/* Search Section */}
      <section className="w-full py-8 px-4 sm:px-0 border-b border-gray-200">
        <div className="container mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search listers by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 sm:px-6 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <Paragraph1 className="text-gray-600 mt-3">
            {filteredUsers.length} lister{filteredUsers.length !== 1 ? "s" : ""}{" "}
            found
          </Paragraph1>
        </div>
      </section>

      {/* Listers Grid */}
      <section className="w-full py-12 sm:py-20 px-4 sm:px-0">
        <div className="container mx-auto">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-16">
              <Paragraph1 className="text-gray-500 text-lg">
                {searchTerm
                  ? "No listers found matching your search."
                  : "No listers available at the moment."}
              </Paragraph1>
            </div>
          ) : (
            <div className="grid grid-cols-3 lg:grid-cols-7 gap-4 sm:gap-6">
              {filteredUsers.map((user) => (
                <Link key={user.id} href={`/lister-profile/${user.id}`}>
                  <div className="group cursor-pointer">
                    {/* Profile Image */}
                    <div className="relative w-full h-[150px] sm:h-[150px] overflow-hidden rounded-full [40px] mb-4 bg-gray-200">
                      <Image
                        src={user.avatar || "/images/default-avatar.jpg"}
                        alt={user.name || "Lister"}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <button className="bg-white text-black px-6 py-2 rounded font-semibold hover:bg-gray-100 transition">
                          View Shop
                        </button>
                      </div>
                    </div>

                    {/* Lister Info */}
                    <div>
                      <Paragraph3 className="text-lg text-center font-bold truncate">
                        {user.name || "Unknown Lister"}
                      </Paragraph3>
                      <Paragraph1 className="text-gray-600 hidden text-sm mt-1">
                        Lister on RELISTED
                      </Paragraph1>

                      {/* Stats or brief info can go here */}
                      <div className="mt-3 text-xs hidden  text-gray-500">
                        <p>Explore their curated collection</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && !searchTerm && (
        <section className="w-full py-8 px-4 sm:px-0 border-t border-gray-200">
          <div className="container mx-auto flex items-center justify-center gap-2">
            {/* Previous button */}
            <button
              onClick={() => {
                if (pagination.currentPage > 1) {
                  setCurrentPage(pagination.currentPage - 1);
                  window.scrollTo(0, 0);
                }
              }}
              disabled={pagination.currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
            >
              Previous
            </button>

            {/* Page numbers */}
            <div className="flex gap-1">
              {Array.from(
                { length: pagination.totalPages },
                (_, i) => i + 1,
              ).map((page) => {
                // Show first page, last page, current page, and pages around current page
                const showPage =
                  page === 1 ||
                  page === pagination.totalPages ||
                  Math.abs(page - pagination.currentPage) <= 1;

                if (!showPage) {
                  // Show ellipsis for skipped pages
                  if (page === 2 && pagination.currentPage > 3) {
                    return (
                      <span key={`ellipsis-start`} className="px-2 py-2">
                        ...
                      </span>
                    );
                  }
                  if (
                    page === pagination.totalPages - 1 &&
                    pagination.currentPage < pagination.totalPages - 2
                  ) {
                    return (
                      <span key={`ellipsis-end`} className="px-2 py-2">
                        ...
                      </span>
                    );
                  }
                  return null;
                }

                return (
                  <button
                    key={page}
                    onClick={() => {
                      setCurrentPage(page);
                      window.scrollTo(0, 0);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      page === pagination.currentPage
                        ? "bg-black text-white"
                        : "border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            {/* Next button */}
            <button
              onClick={() => {
                if (pagination.currentPage < pagination.totalPages) {
                  setCurrentPage(pagination.currentPage + 1);
                  window.scrollTo(0, 0);
                }
              }}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
            >
              Next
            </button>
          </div>

          {/* Page info */}
          <div className="container hidden mx-auto text-center mt-4">
            <Paragraph1 className="text-gray-600 text-sm">
              Page {pagination.currentPage} of {pagination.totalPages} • Showing{" "}
              {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}-
              {Math.min(
                pagination.currentPage * pagination.itemsPerPage,
                pagination.totalItems,
              )}{" "}
              of {pagination.totalItems} listers
            </Paragraph1>
          </div>
        </section>
      )}

      {/* Featured Section */}
      {filteredUsers.length > 0 && !searchTerm && (
        <section className="w-full bg-gray-100 py-12 sm:py-20 px-4 sm:px-0">
          <div className="container mx-auto">
            <div className="text-center mb-8">
              <Header2 className="text-2xl sm:text-3xl font-bold mb-2">
                Discover Amazing Collections
              </Header2>
              <Paragraph1 className="text-gray-600">
                Each lister on RELISTED brings their unique style and curated
                selections. Browse through their collections and find pieces
                that speak to you.
              </Paragraph1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-white p-6 rounded-lg text-center">
                <h3 className="font-bold text-lg mb-2">Diverse Selection</h3>
                <Paragraph1 className="text-gray-600 text-sm">
                  From vintage finds to contemporary pieces, explore a wide
                  variety of styles
                </Paragraph1>
              </div>
              <div className="bg-white p-6 rounded-lg text-center">
                <h3 className="font-bold text-lg mb-2">Quality & Trust</h3>
                <Paragraph1 className="text-gray-600 text-sm">
                  All listers are verified members committed to providing
                  quality rentals
                </Paragraph1>
              </div>
              <div className="bg-white p-6 rounded-lg text-center">
                <h3 className="font-bold text-lg mb-2">Easy Rental Process</h3>
                <Paragraph1 className="text-gray-600 text-sm">
                  Simple booking, secure payment, and hassle-free returns for
                  every rental
                </Paragraph1>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
