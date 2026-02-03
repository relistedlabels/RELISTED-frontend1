"use client";

import React, { useState } from "react";
import { Header1Plus, Header2, Paragraph1 } from "@/common/ui/Text";
import { useUsers } from "@/lib/queries/user/useUsers";
import Link from "next/link";
import Image from "next/image";

export default function AllListersPage() {
  const { data: users, isLoading, error } = useUsers();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers =
    users?.filter((user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredUsers.map((user) => (
                <Link key={user.id} href={`/shop/${user.id}`}>
                  <div className="group cursor-pointer">
                    {/* Profile Image */}
                    <div className="relative w-full h-[250px] sm:h-[280px] overflow-hidden rounded-lg mb-4 bg-gray-200">
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
                      <Header2 className="text-lg font-bold truncate">
                        {user.name || "Unknown Lister"}
                      </Header2>
                      <Paragraph1 className="text-gray-600 text-sm mt-1">
                        Lister on RELISTED
                      </Paragraph1>

                      {/* Stats or brief info can go here */}
                      <div className="mt-3 text-xs text-gray-500">
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
