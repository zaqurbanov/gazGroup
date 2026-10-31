/**
 * Delivery story timeline. `p` is the scroll progress (0..1) through the delivery section.
 *
 *   0.00 - 0.12  the cylinder leaves its stock position and stands on the ground in the front lane
 *   0.10 - 0.36  the truck drives in from the left in the back lane and stops beside it
 *   0.36 - 0.44  the cylinder lifts
 *   0.44 - 0.52  it swings across to the bed
 *   0.52 - 0.60  it lowers onto the deck, a pulse confirms it is secured
 *   0.64 - 1.00  the truck accelerates away to the right, the camera tracks it
 *
 * Everything is stage space (before the uniform stage scale U). Pure functions, no three.js objects.
 */

export const GROUND = -1.5;
/** Height of the truck deck above the ground. */
export const DECK = 0.95;
export const TANK_S = 0.34;
export const WHEEL_R = 0.38;

const TANK_BASE = 2.2 * TANK_S; // tank origin to its foot
export const STAND_X = -0.4;
export const FRONT_Z = 0.9;
export const BACK_Z = -1.0;
const LIFT = 1.7;

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);
const outCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const inCubic = (t: number) => t * t * t;
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));

export type Start = { x: number; y: number; s: number };

export type StoryFrame = {
  /** Truck origin (bed centre) on the road, stage space. */
  truckX: number;
  /** Camera tracking offset, subtracted from every stage x. */
  camX: number;
  wheelAngle: number;
  /** Scenery opacity, 0..1. */
  fade: number;
  /** Tank pose in world space (stage scale already applied). */
  tank: { x: number; y: number; z: number; s: number; ry: number };
  /** Contact shadow under the tank while it is on the ground. */
  tankShadow: { x: number; z: number; opacity: number };
  /** 0..1 while the "secured" pulse plays, -1 otherwise. */
  pulse: number;
  step: 1 | 2 | 3;
};

export function storyAt(p: number, U: number, start: Start): StoryFrame {
  const c = clamp(p);

  let truckX: number;
  if (c < 0.1) truckX = -11;
  else if (c < 0.36) truckX = lerp(-11, STAND_X, outCubic(seg(c, 0.1, 0.36)));
  else if (c < 0.64) truckX = STAND_X;
  else truckX = lerp(STAND_X, 18, inCubic(seg(c, 0.64, 1)));

  const camX = c > 0.64 ? 0.55 * (truckX - STAND_X) : 0;

  const standY = GROUND + TANK_BASE;
  const deckY = GROUND + DECK + TANK_BASE;

  let tx = STAND_X;
  let ty = standY;
  let tz = FRONT_Z;
  if (c >= 0.36 && c < 0.44) {
    ty = lerp(standY, standY + LIFT, smooth(seg(c, 0.36, 0.44)));
  } else if (c >= 0.44 && c < 0.52) {
    const t = smooth(seg(c, 0.44, 0.52));
    ty = standY + LIFT + Math.sin(t * Math.PI) * 0.25;
    tz = lerp(FRONT_Z, BACK_Z, t);
  } else if (c >= 0.52) {
    tz = BACK_Z;
    ty = lerp(standY + LIFT, deckY, smooth(seg(c, 0.52, 0.6)));
    // Once loaded the cylinder rides with the truck.
    tx = c >= 0.6 ? truckX : STAND_X;
  }

  // Blend from the stock position into the stage pose at the start of the section.
  const b = smooth(seg(c, 0, 0.12));
  const tank = {
    x: lerp(start.x, U * (tx - camX), b),
    y: lerp(start.y, U * ty, b),
    z: lerp(0, U * tz, b),
    s: lerp(start.s, TANK_S * U, b),
    ry: lerp(0.9, 0.4 + 0.3 * smooth(seg(c, 0.36, 0.7)), b),
  };

  const onGround = c < 0.36 ? 1 : 1 - smooth(seg(c, 0.36, 0.44));
  const fade = smooth(seg(c, 0, 0.06)) * (1 - smooth(seg(c, 0.9, 1)));

  return {
    truckX,
    camX,
    wheelAngle: -truckX / WHEEL_R,
    fade,
    tank,
    tankShadow: { x: STAND_X - camX, z: FRONT_Z, opacity: c >= 0.52 ? 0 : onGround * smooth(seg(c, 0.04, 0.12)) },
    pulse: c >= 0.58 && c < 0.7 ? seg(c, 0.58, 0.7) : -1,
    step: c < 0.34 ? 1 : c < 0.62 ? 2 : 3,
  };
}

/** Moves `current` toward `target` along the shortest way around the circle. */
export function dampAngle(current: number, target: number, k: number): number {
  const tau = Math.PI * 2;
  const diff = ((((target - current) % tau) + tau + Math.PI) % tau) - Math.PI;
  return current + diff * k;
}
