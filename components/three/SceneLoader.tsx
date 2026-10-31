"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

function canRender3D(): boolean {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (connection?.saveData) return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/** The hero is a video, so WebGL (and the three.js bundle) only loads once the visitor starts scrolling. */
export function SceneLoader() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!canRender3D()) return;
    const start = () => setReady(true);
    if (window.scrollY > 0) {
      start();
      return;
    }
    window.addEventListener("scroll", start, { once: true, passive: true });
    return () => window.removeEventListener("scroll", start);
  }, []);

  return ready ? <Scene /> : null;
}
