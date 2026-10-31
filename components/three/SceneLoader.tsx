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

/**
 * The hero is a video, so WebGL stays out of the critical path. The scene mounts (hidden, paused) a few
 * seconds after load while the visitor reads the hero, or immediately on the first scroll. That moves the
 * three.js parse, context creation and shader compilation out of the first scroll, where it froze the page.
 */
const WARM_UP_MS = 4000;

export function SceneLoader() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!canRender3D()) return;
    const start = () => setReady(true);
    if (window.scrollY > 0) {
      start();
      return;
    }
    const idle = (window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 0))).bind(window);
    const timer = window.setTimeout(() => idle(start), WARM_UP_MS);
    window.addEventListener("scroll", start, { once: true, passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", start);
    };
  }, []);

  return ready ? <Scene /> : null;
}
