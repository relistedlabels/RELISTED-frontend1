import React from "react";
import Image from "next/image";
import Link from "next/link";

import { Search, Heart, ShoppingCart, ChevronDown, ShoppingBag, ShoppingBagIcon } from "lucide-react";
import { ParagraphLink1 } from "../ui/Text";
import Button from "../ui/Button"; 
import BrandsDropdown from "./BrandsDropdown";

export default function DesktopNavbar() {
  return (
    <nav className="bg-black hidden xl:block text-white fixed w-full z-99  ">
      <div className="flex items-center justify-between container mx-auto w-full py-[21px]">
        {/* Left Section */}
        <div className="flex items-center space-x-8 text-sm font-light">
          {/* Center Logo */}
          <div>
            <Image src="/images/logo.svg" alt="Logo" width={45} height={45} />
          </div>
          <Link href="/shop">
            <ParagraphLink1>Shop</ParagraphLink1>
          </Link>
          <BrandsDropdown />
          <Link href="#">
            <ParagraphLink1>Style Spotlight</ParagraphLink1>
          </Link>
          <Link href="/how-it-works">
            <ParagraphLink1>How it works</ParagraphLink1>
          </Link>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-6 text-sm font-light">
          <div className="flex items-center space-x-2 border-b border-gray-600 pb-1">
            <Search className="w-5 h-5" />
            {/* <input
              type="text"
              placeholder="Search"
              className="bg-transparent outline-none placeholder-gray-400 text-sm w-[173px]"
            /> */}
          </div>

          <div className="flex items-center space-x-1">
            <Heart className="w-5 h-5" />
            <span>0</span>
          </div>

          <div className="flex items-center space-x-1">
            <ShoppingBagIcon className="w-5 h-5" />
            <span>2</span>
          </div>
          <div className="flex gap-[9px] items-center">
            {" "}
            <Button
              text="Sign In"
              backgroundColor="bg-transparent"
              border="border border-white"
              color="text-white"
            />
            <Button
              text="Sign Up"
              backgroundColor="bg-white"
              color="text-black hover:text-white"
              border="border border-white"
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
