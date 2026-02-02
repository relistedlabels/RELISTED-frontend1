"use client";

import { Header1Plus, Paragraph1 } from "@/common/ui/Text";
import { useState, useRef } from "react";

export default function HowItWorksVideo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handlePlay = () => {
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  return (
    <section className="w-full mx-auto px-4 sm:px-0 container py-[45px] flex flex-col items-center">
      {/* VIDEO WRAPPER */}
      <div className="relative w-full sm:h-[462px] mt-6 rounded-lg overflow-hidden">
        {/* VIDEO */}
        <video
          ref={videoRef}
          src="/sample-video.mp4" // replace with your actual video
          className="w-full h-auto"
          poster="/images/vi33.jpg"
        />

        {/* DARK OVERLAY WHEN NOT PLAYING */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
            {/* PLAY BUTTON */}
            <button
              onClick={handlePlay}
              className="flex flex-col items-center justify-center text-white"
            >
              <div className="w-36 h-36  rounded-full flex items-center justify-center">
                <img src="/icons/play1.svg" alt="" />
              </div>
              <Paragraph1 className="mt-2 text-white font-medium">
                Play
              </Paragraph1>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
