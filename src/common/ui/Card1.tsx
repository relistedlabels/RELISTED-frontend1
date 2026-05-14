"use client";

import { Paragraph1 } from "./Text";
import { cloudinaryOptimizedImageUrl } from "@/lib/media/cloudinaryOptimizedImageUrl";

interface Card1Props {
  image: string;
  role: string;
  name: string;
}

export default function Card1({ image, name, role }: Card1Props) {
  const heroSrc = cloudinaryOptimizedImageUrl(image, { maxWidth: 800 });
  return (
    <div className="min-w-[260px] max-w-[260px] overflow-hidden bg-white  ">
      {/* Image as background */}
      <div
        className="w-full h-[322px] bg-cover bg-center"
        style={{ backgroundImage: `url("${heroSrc}")` }}
      ></div>

      <div className="py-4 ">
        <Paragraph1 className="  mt-1">{name}</Paragraph1>
        <Paragraph1 className="  mt-">{role}</Paragraph1>
      </div>
    </div>
  );
}
