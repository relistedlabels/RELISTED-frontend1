// ENDPOINTS: GET /api/public/users/:userId/products

"use client";

import { useState } from "react";
import { products } from "@/data/productsData";
import ProductCard from "@/common/ui/ProductCard";
import { Header1Plus, Paragraph1 } from "@/common/ui/Text";
import { SlidersVertical } from "lucide-react";
import Filters from "./Filters";

export default function NewListingsSection() {
  const [search, setSearch] = useState("");

  const filteredProducts = products.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.brand.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <section className="w-full ">
      <div className=" container mx-auto">
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-4 mb-6">
          {/* Left Controls */}
          <div className=" hidden sm:flex items-center gap-4">
            <Filters />
          </div>

          {/* Title */}
          <Header1Plus className="sm:text-center uppercase  font-light flex-1">
            All Listings{" "}
          </Header1Plus>

          <div className="flex sm:hidden  items-center gap-4">
            <Filters />
          </div>

          {/* Search */}
          <div className="w-full md:w-[200px] hidden sm:flex">
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border w-full px-4 py-2  text-sm focus:outline-none"
            />
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredProducts.map((item, index) => (
            <ProductCard
              key={index}
              image={item.image}
              brand={item.brand}
              name={item.name}
              price={item.price}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
