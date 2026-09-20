"use client";

import { useEffect, useRef, useState } from "react";

const HERO_MP4_SRC = "/videos/hero1.mp4";
const HERO_POSTER_SRC = "/videos/hero1-poster.jpg";

function isSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isWebKit = /AppleWebKit/.test(ua);
  const isOtherIOSBrowser = /(CriOS|FxiOS|OPiOS|EdgiOS)/.test(ua);
  return (isWebKit && !/Chrome|Chromium|Edg|OPR|SamsungBrowser/.test(ua)) || (isIOS && !isOtherIOSBrowser);
}

/**
 * Defer attaching the MP4 until the browser is idle (or a short timeout).
 * Keeps the hero poster visible first so the document and JS bundles are not
 * racing the same connection as a multi-megabyte Range request on first paint.
 */
export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [fade, setFade] = useState(false);
  const [srcReady, setSrcReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const enable = () => {
      if (!cancelled) setSrcReady(true);
    };

    let idleId: number | undefined;
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
    const video = videoRef.current;
    if (!video || !srcReady) return;

    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.setAttribute("x-webkit-airplay", "deny");

    const startPlayback = () => {
      if (document.hidden) return;
      void video.play().catch(() => {});
    };

    const schedulePlayback = () => {
      // Safari shows a native play overlay when the autoplay attribute is present.
      // Programmatic play (especially deferred with setTimeout) avoids that UI.
      if (isSafari()) {
        window.setTimeout(startPlayback, 0);
      } else {
        startPlayback();
      }
    };

    const handlePlaying = () => {
      if (video.currentTime > 0) setIsPlaying(true);
    };

    schedulePlayback();

    video.addEventListener("loadeddata", schedulePlayback);
    video.addEventListener("canplay", schedulePlayback);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("timeupdate", handlePlaying);

    const handleVisibility = () => {
      if (!document.hidden) schedulePlayback();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) schedulePlayback();
      },
      { threshold: 0.1 },
    );
    observer.observe(video);

    // Low Power Mode and strict autoplay policies may block until first interaction.
    const unlockOnInteraction = () => schedulePlayback();
    window.addEventListener("touchstart", unlockOnInteraction, {
      once: true,
      passive: true,
    });
    window.addEventListener("scroll", unlockOnInteraction, {
      once: true,
      passive: true,
    });

    return () => {
      video.removeEventListener("loadeddata", schedulePlayback);
      video.removeEventListener("canplay", schedulePlayback);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("timeupdate", handlePlaying);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("touchstart", unlockOnInteraction);
      window.removeEventListener("scroll", unlockOnInteraction);
      observer.disconnect();
    };
  }, [srcReady]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !srcReady) return;

    const FADE_DURATION = 0.5;

    const handleTimeUpdate = () => {
      if (!video.duration) return;

      const timeLeft = video.duration - video.currentTime;

      if (timeLeft <= FADE_DURATION) {
        setFade(true);
      } else {
        setFade(false);
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, [srcReady]);

  return (
    <div className="absolute inset-0">
      <video
        ref={videoRef}
        src={srcReady ? HERO_MP4_SRC : undefined}
        loop
        muted
        playsInline
        disablePictureInPicture
        disableRemotePlayback
        controls={false}
        controlsList="nodownload nofullscreen noremoteplayback noplaybackrate"
        preload={srcReady ? "auto" : "none"}
        aria-hidden
        tabIndex={-1}
        className={`
          hero-bg-video pointer-events-none select-none
          absolute inset-0 w-full h-full object-cover xl:object-contain
          transition-opacity duration-1000 ease-in-out
          ${fade ? "opacity-0" : "opacity-100"}
        `}
      />

      {/* Covers Safari's native play overlay until frames are actually playing. */}
      <img
        src={HERO_POSTER_SRC}
        alt=""
        aria-hidden
        draggable={false}
        className={`
          hero-bg-video-cover pointer-events-none select-none
          absolute inset-0 w-full h-full object-cover xl:object-contain
          transition-opacity duration-700 ease-out
          ${isPlaying ? "opacity-0" : "opacity-100"}
        `}
      />
    </div>
  );
}
