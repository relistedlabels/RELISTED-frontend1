"use client";

import { CalendarDays, ShoppingBag } from "lucide-react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";

export function RenterRentOrBuyCards() {
  return (
    <div className="space-y-3">
      <div className="p-4 border-2 border-gray-200 rounded-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex justify-center items-center bg-white border border-black rounded-full w-10 h-10">
            <CalendarDays className="w-5 h-5 text-black" aria-hidden />
          </div>
          <div>
            <span className="inline-block bg-white mb-1 px-2.5 py-0.5 border border-black rounded-full font-semibold text-[10px]">
              RENT
            </span>
            <Paragraph1 className="font-semibold text-gray-900 text-sm">
              Rent
            </Paragraph1>
          </div>
        </div>
        <Paragraph3 className="text-gray-600 text-xs leading-relaxed">
          Pick dates, wear it, return when done.
        </Paragraph3>
      </div>

      <div className="bg-[#231F20] p-4 border-2 border-[#231F20] rounded-xl text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex justify-center items-center bg-black border border-white rounded-full w-10 h-10">
            <ShoppingBag className="w-5 h-5 text-white" aria-hidden />
          </div>
          <div>
            <span className="inline-block bg-black mb-1 px-2.5 py-0.5 border border-white rounded-full font-semibold text-[10px]">
              BUY
            </span>
            <Paragraph1 className="font-semibold text-sm">Buy</Paragraph1>
          </div>
        </div>
        <Paragraph3 className="text-gray-300 text-xs leading-relaxed">
          Purchase outright. Yours to keep.
        </Paragraph3>
      </div>

      <Paragraph3 className="text-gray-500 text-xs text-center leading-relaxed">
        Some items offer both. You choose on the product page.
      </Paragraph3>
    </div>
  );
}
