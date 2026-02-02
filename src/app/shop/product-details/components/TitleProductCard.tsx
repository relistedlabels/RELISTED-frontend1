import { Header1Plus, Paragraph1 } from "@/common/ui/Text";
import React from "react";
import SizeGuide from "./SizeGuide";

const TitleProductCard: React.FC = () => {
  return (
    <div className="font-sans">
      {/* Brand Name */}
      <Paragraph1 className="  text-gray-700 tracking-wider mb-1">
        Fendi
      </Paragraph1>

      {/* Product Name */}
      <Header1Plus className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-black mb-1 leading-tight">
        Fendi Arco
      </Header1Plus>

      {/* Product Description */}
      <Paragraph1 className="text-base sm:text-lg md:text-xl text-gray-700 mb-3">
        Black hagfish leather boots
      </Paragraph1>

      {/* Ratings and Reviews */}
      <div className="flex items-center mb-5">
        <div className="text-lg sm:text-xl text-yellow-500 mr-2">
          <span aria-label="5 star rating">★★★★★</span>
        </div>
        <Paragraph1 className="text-base sm:text-lg font-bold text-gray-900 mr-2">
          4.9
        </Paragraph1>
        <Paragraph1 className="text-sm sm:text-base text-gray-500">
          (12 Reviews)
        </Paragraph1>
      </div>

      {/* Tags and Size Guide */}
      <div className="flex flex-col items-start sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap g items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <div className="px-3 py-1 whitespace-nowrap   border border-gray-300 rounded-full bg-white text-gray-800">
            <Paragraph1>Black</Paragraph1>
          </div>
          <div className="px-3 py-1 whitespace-nowrap   border border-gray-300 rounded-full bg-white text-gray-800">
            <Paragraph1>Size 42</Paragraph1>
          </div>
          <div className="px-3 py-1 whitespace-nowrap   border border-gray-300 rounded-full bg-white text-gray-800">
            <Paragraph1>Stylish</Paragraph1>
          </div>
          <div className="px-3 py-1 whitespace-nowrap   border border-gray-300 rounded-full bg-white text-gray-800">
            <Paragraph1>Excellent Condition</Paragraph1>
          </div>
        </div>

        {/* Size Guide Link */}
       <SizeGuide />
      </div>
    </div>
  );
};

export default TitleProductCard;
