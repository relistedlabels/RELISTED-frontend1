"use client";

import { useEffect, useRef, useState } from "react";

const HERO_MP4_SRC = "/videos/hero1.mp4";

function isSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isWebKit = /AppleWebKit/.test(ua);
  const isOtherIOSBrowser = /(CriOS|FxiOS|OPiOS|EdgiOS)/.test(ua);
  return (
    (isWebKit && !/Chrome|Chromium|Edg|OPR|SamsungBrowser/.test(ua)) ||
    (isIOS && !isOtherIOSBrowser)
  );
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

    const startPlayback = () => {
      void video.play().catch(() => {});
    };

    // Never rely on the autoplay attribute: Safari shows a native play overlay when
    // it is present. Programmatic play after the source attaches works everywhere.
    if (isSafari()) {
      window.setTimeout(startPlayback, 0);
    } else {
      startPlayback();
    }
    video.addEventListener("canplay", startPlayback, { once: true });
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
    <video
      ref={videoRef}
      loop
      muted
      playsInline
      poster="/videos/hero1-poster.jpg"
      preload={srcReady ? "metadata" : "none"}
      className={`
        absolute inset-0 w-full h-full object-cover xl:object-contain
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
