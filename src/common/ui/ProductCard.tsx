"use client";

import Link from "next/link";
import { Paragraph1 } from "./Text";
import { Heart } from "lucide-react";

interface ProductCardProps {
  id: string;
  image: string;
  brand: string;
  name: string;
  price: string;
}

export default function ProductCard({
  id,
  image,
  brand,
  name,
  price,
}: ProductCardProps) {
  return (
    <Link href={`/shop/product-details/${id}`} className="overflow-hidden ">
      {/* Image wrapper */}
      <div className="relative w-full h-[230px] sm:h-[270px]">
        {/* Background image */}
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${image})` }}
        ></div>

        {/* Love icon */}
        <button className="absolute top-3 right-3 bg-black/20 backdrop-blur-sm p-1.5 rounded-full hover:bg-white transition">
          <Heart className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="py-4">
        <Paragraph1 className="text-xs font-semibold tracking-wide">
          {brand}
        </Paragraph1>
        <Paragraph1 className="text-gray-700 mt-1">{name}</Paragraph1>
        <Paragraph1 className=" text-gray-700- mt-2">
          Rent from <span className=" text-black font-semibold">₦2,000 </span>
        </Paragraph1>
        <Paragraph1 className="text-gray-400 mt-2 line-through">
          RRP: {price}
        </Paragraph1>
      </div>
    </Link>
  );
}
