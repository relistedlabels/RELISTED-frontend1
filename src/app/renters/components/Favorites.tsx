// ENDPOINTS: GET /api/renters/favorites, POST /api/renters/favorites/:itemId, DELETE /api/renters/favorites/:itemId

"use client";

import { useState } from "react";
import { products } from "@/data/productsData";
import ProductCard from "@/common/ui/ProductCard";
import { Header1Plus, Paragraph1 } from "@/common/ui/Text";
import { SlidersVertical } from "lucide-react";

export default function Favorites() {
  const [search, setSearch] = useState("");

  const filteredProducts = products.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.brand.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <section className="w-full  ">
      <div className=" container mx-auto">
        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
