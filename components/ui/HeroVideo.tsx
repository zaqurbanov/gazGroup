"use client";

import { useEffect, useRef } from "react";

/**
 * Decorative hero background. The poster is the first paint; the video only starts after hydration,
 * stays paused off-screen, and never plays with reduced motion or data saver.
 */
export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || connection?.saveData) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => undefined);
      else video.pause();
    });
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      aria-hidden="true"
      tabIndex={-1}
      muted
      loop
      playsInline
      preload="none"
      poster="/hero-poster.webp"
      className="hero-parallax absolute inset-x-0 top-0 h-[125%] w-full object-cover object-[78%_center]"
    >
      <source src="/hero-loop.mp4" type="video/mp4" />
    </video>
  );
}
