import * as THREE from "three";
import type { Mode } from "./store";

/** Where the group sits per mode on a wide screen; narrow screens move it behind the text. */
const layout: Record<Mode, { x: number; y: number; z: number; s: number }> = {
  molecule: { x: 3.1, y: 0, z: 0, s: 1.15 },
  tank: { x: 3.2, y: -0.15, z: 0, s: 0.95 },
  cloud: { x: 0, y: 0, z: -2, s: 1 },
};

export type Placement = {
  x: number;
  y: number;
  z: number;
  s: number;
  halfW: number;
  halfH: number;
  phone: boolean;
  /** Uniform scale for the delivery stage so a truck always fits the screen width. */
  U: number;
};

/**
 * Placement follows the live viewport. World units visible at z = 0 depend on the camera and aspect ratio,
 * so the group stays inside the screen on phones, tablets and narrow windows.
 */
export function placementFor(
  mode: Mode,
  camera: THREE.PerspectiveCamera,
  size: { width: number; height: number },
): Placement {
  const cfg = layout[mode];
  const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
  const halfW = halfH * (size.width / size.height);
  const phone = size.width < 768;
  // Rough half-width of what is drawn, used to keep it inside the screen.
  const extent = mode === "molecule" ? 2.1 : mode === "tank" ? 0.75 : 0;

  const x = phone ? halfW * 0.4 : Math.min(cfg.x, halfW * 0.62);
  const y = phone ? halfH * 0.6 : cfg.y;
  let s = cfg.s * (phone ? 0.5 : 1);
  if (extent > 0) s = Math.min(s, Math.max(0.25, (halfW - Math.abs(x) - 0.2) / extent));
  // A tall cylinder must also fit the screen height.
  if (mode === "tank") s = Math.min(s, (halfH * 2 * (phone ? 0.42 : 0.82)) / 4.8);

  return { x, y, z: cfg.z, s, halfW, halfH, phone, U: Math.min(1, halfW / 4.0) };
}
