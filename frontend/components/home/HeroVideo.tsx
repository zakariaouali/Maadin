"use client";

import { useEffect, useState } from "react";

/**
 * Decorative background video for the hero.
 *
 * The file is ~11 MB, so it must not be forced on everyone: phones, data-saver
 * mode, slow connections and "reduce motion" users just get the plain dark
 * background (the section already has one), and everyone else only starts the
 * download once the page has settled, so it never competes with the text and
 * images that matter.
 */
export default function HeroVideo() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const wideScreen = window.matchMedia("(min-width: 768px)").matches;
    const wantsMotion = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const connection = (navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }).connection;
    const slowConnection =
      !!connection?.saveData || /(^|-)(2g|3g)$/.test(connection?.effectiveType ?? "");

    if (!wideScreen || !wantsMotion || slowConnection) return;

    const timer = window.setTimeout(() => setEnabled(true), 1500);
    return () => window.clearTimeout(timer);
  }, []);

  if (!enabled) return null;

  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      className="absolute inset-0 w-full h-full object-cover z-0 scale-105"
      style={{ filter: "blur(3px)" }}
      aria-hidden="true"
    >
      <source src="/artisan-video.mp4" type="video/mp4" />
    </video>
  );
}
