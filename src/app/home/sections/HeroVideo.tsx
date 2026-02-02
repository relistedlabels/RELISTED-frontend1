"use client";

import { useEffect, useRef, useState } from "react";

export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const FADE_DURATION = 0.5; // seconds before end to fade out

    const handleTimeUpdate = () => {
      if (!video.duration) return;

      const timeLeft = video.duration - video.currentTime;

      // Fade out near the end
      if (timeLeft <= FADE_DURATION) {
        setFade(true);
      } else {
        setFade(false);
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, []);

  return (
    <video
      ref={videoRef}
      autoPlay
      loop
      muted
      playsInline
      className={`
        absolute inset-0 w-full h-full object-cover sm:object-contain
        transition-opacity duration-1000 ease-in-out
        ${fade ? "opacity-0" : "opacity-100"}
      `}
    >
      <source src="/videos/hero1.mp4" type="video/mp4" />
    </video>
  );
}
