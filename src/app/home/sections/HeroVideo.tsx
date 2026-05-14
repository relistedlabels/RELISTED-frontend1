"use client";

import { useEffect, useRef, useState } from "react";

const HERO_MP4_SRC = "/videos/hero1.mp4";

/**
 * Defer attaching the MP4 until the browser is idle (or a short timeout).
 * Keeps the hero poster visible first so the document and JS bundles are not
 * racing the same connection as a multi-megabyte Range request on first paint.
 */
export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [fade, setFade] = useState(false);
  const [srcReady, setSrcReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const enable = () => {
      if (!cancelled) setSrcReady(true);
    };

    let idleId: number | undefined;
    /** Browser timers are numeric handles; `ReturnType<typeof setTimeout>` can be `NodeJS.Timeout` when Node typings are in scope. */
    let timeoutId: number | undefined;

    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(enable, { timeout: 2000 });
    } else {
      timeoutId = window.setTimeout(enable, 800);
    }

    return () => {
      cancelled = true;
      if (idleId != null) window.cancelIdleCallback(idleId);
      if (timeoutId != null) window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (!srcReady) return;
    videoRef.current?.load();
  }, [srcReady]);

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
      poster="/videos/hero1-poster.jpg"
      preload={srcReady ? "metadata" : "none"}
      className={`
        absolute inset-0 w-full h-full object-cover sm:object-contain
        transition-opacity duration-1000 ease-in-out
        ${fade ? "opacity-0" : "opacity-100"}
      `}
    >
      {srcReady ? (
        <source src={HERO_MP4_SRC} type="video/mp4" />
      ) : null}
    </video>
  );
}
