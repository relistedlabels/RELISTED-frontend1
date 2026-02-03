"use client";

import { Paragraph1 } from "@/common/ui/Text";
import React from "react";

type Props = {
  min: number;
  max: number;
  value: [number, number];
  onChange: (val: [number, number]) => void;
};

export default function PriceRangeSlider({ min, max, value, onChange }: Props) {
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.min(Number(e.target.value), value[1] - 1);
    onChange([newMin, value[1]]);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.max(Number(e.target.value), value[0] + 1);
    onChange([value[0], newMax]);
  };

  return (
    <section>
      {/* LABEL */}
      <Paragraph1 className="uppercase font-bold text-xs mb-3 text-gray-800">
        Price Range
      </Paragraph1>

      {/* DISPLAY VALUES */}
      <div className="flex justify-between text-sm mb-4">
        <Paragraph1 className="font-bold text-gray-400">Range</Paragraph1>
        <Paragraph1 className="font-semibold">
          ₦{value[0].toLocaleString()} - ₦{value[1].toLocaleString()}
        </Paragraph1>
      </div>

      {/* SLIDER CONTAINER */}
      <div className="relative w-full h-2">
        {/* background track */}
        <div className="absolute w-full h-1 bg-gray-200 rounded"></div>

        {/* colored track */}
        <div
          className="absolute h-1 bg-black rounded"
          style={{
            left: `${((value[0] - min) / (max - min)) * 100}%`,
            width: `${((value[1] - value[0]) / (max - min)) * 100}%`,
          }}
        />

        {/* MIN SLIDER */}
        <input
          type="range"
          min={min}
          max={max}
          value={value[0]}
          onChange={handleMinChange}
          className="absolute -top-1 w-full pointer-events-none appearance-none 
                     [&::-webkit-slider-thumb]:appearance-none 
                     [&::-webkit-slider-thumb]:h-4 
                     [&::-webkit-slider-thumb]:w-4 
                     [&::-webkit-slider-thumb]:rounded-full 
                     [&::-webkit-slider-thumb]:bg-black 
                     [&::-webkit-slider-thumb]:pointer-events-auto"
        />

        {/* MAX SLIDER */}
        <input
          type="range"
          min={min}
          max={max}
          value={value[1]}
          onChange={handleMaxChange}
          className="absolute -top-1 w-full pointer-events-none appearance-none 
                     [&::-webkit-slider-thumb]:appearance-none 
                     [&::-webkit-slider-thumb]:h-4 
                     [&::-webkit-slider-thumb]:w-4 
                     [&::-webkit-slider-thumb]:rounded-full 
                     [&::-webkit-slider-thumb]:bg-black 
                     [&::-webkit-slider-thumb]:pointer-events-auto"
        />
      </div>
    </section>
  );
}
