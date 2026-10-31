export type Mode = "molecule" | "tank" | "cloud";

/**
 * Mutable scene state read every frame by the WebGL loop. It lives outside React on purpose:
 * scroll position, pointer and fill level change continuously and must not trigger re-renders.
 */
export const sceneStore = {
  mode: "molecule" as Mode,
  narrow: false,
  px: 0,
  py: 0,
  fill: 0.12,
  /** 0 while particles ease toward targets, 1 once they follow the tank stream directly. */
  flow: 0,
};

/** Small seeded PRNG so particle layouts are deterministic (and pure during render). */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
