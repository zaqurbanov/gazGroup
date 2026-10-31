"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { bodyProfile, shoulderProfile } from "./Tank";
import { DECK, TANK_S, WHEEL_R } from "./timeline";

const mat = {
  white: new THREE.MeshPhysicalMaterial({ color: "#eef2f5", roughness: 0.32, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.14 }),
  navy: new THREE.MeshPhysicalMaterial({ color: "#0f3d5e", roughness: 0.34, metalness: 0.45, clearcoat: 1, clearcoatRoughness: 0.22 }),
  emerald: new THREE.MeshPhysicalMaterial({ color: "#10b981", roughness: 0.38, metalness: 0.25, clearcoat: 0.8, clearcoatRoughness: 0.25 }),
  glass: new THREE.MeshPhysicalMaterial({ color: "#4a6b84", roughness: 0.04, metalness: 0.75, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 2.2 }),
  steel: new THREE.MeshStandardMaterial({ color: "#46535f", roughness: 0.5, metalness: 0.8 }),
  dark: new THREE.MeshStandardMaterial({ color: "#1b252e", roughness: 0.65, metalness: 0.6 }),
  rubber: new THREE.MeshStandardMaterial({ color: "#111519", roughness: 0.95, metalness: 0 }),
  rim: new THREE.MeshStandardMaterial({ color: "#a9b6c0", roughness: 0.35, metalness: 0.95 }),
  chrome: new THREE.MeshStandardMaterial({ color: "#d8e0e6", roughness: 0.18, metalness: 1 }),
  headlight: new THREE.MeshStandardMaterial({ color: "#ffffff", emissive: "#fff6e0", emissiveIntensity: 1.4, roughness: 0.2 }),
  tail: new THREE.MeshStandardMaterial({ color: "#8a1c22", emissive: "#d3272f", emissiveIntensity: 0.9, roughness: 0.3 }),
  plate: new THREE.MeshStandardMaterial({ color: "#f4f4f0", roughness: 0.5 }),
};

const geoCache = new Map<string, THREE.BufferGeometry>();
function rbox(w: number, h: number, d: number, r = 0.02) {
  const key = `${w}|${h}|${d}|${r}`;
  let g = geoCache.get(key);
  if (!g) {
    g = new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2));
    geoCache.set(key, g);
  }
  return g;
}

type V3 = [number, number, number];

function RB({ size, pos, rot, m, r }: { size: V3; pos: V3; rot?: V3; m: THREE.Material; r?: number }) {
  return <mesh geometry={rbox(size[0], size[1], size[2], r)} material={m} position={pos} rotation={rot} />;
}

/* ---------- cab ---------- */

const CAB_BOTTOM = 0.82;
const CAB_HALF = 0.7;

/** Side profile of a cab-over cab (x forward, y up), extruded across the width with a soft bevel. */
function cabGeometry() {
  const s = new THREE.Shape();
  s.moveTo(1.62, CAB_BOTTOM);
  s.lineTo(1.62, 1.88);
  s.quadraticCurveTo(1.62, 2.04, 1.8, 2.04);
  s.lineTo(2.32, 2.04);
  s.quadraticCurveTo(2.46, 2.04, 2.52, 1.92);
  s.lineTo(2.74, 1.46);
  s.quadraticCurveTo(2.79, 1.34, 2.79, 1.2);
  s.lineTo(2.79, 0.9);
  s.quadraticCurveTo(2.79, CAB_BOTTOM, 2.7, CAB_BOTTOM);
  s.lineTo(1.62, CAB_BOTTOM);
  const g = new THREE.ExtrudeGeometry(s, {
    depth: CAB_HALF * 2,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 4,
    curveSegments: 18,
  });
  g.translate(0, 0, -CAB_HALF);
  return g;
}

/** Painted lower band of the cab, slightly proud of the white body. */
function cabBandGeometry() {
  const s = new THREE.Shape();
  s.moveTo(1.62, CAB_BOTTOM);
  s.lineTo(1.62, 1.1);
  s.lineTo(2.79, 1.1);
  s.lineTo(2.79, 0.9);
  s.quadraticCurveTo(2.79, CAB_BOTTOM, 2.7, CAB_BOTTOM);
  s.lineTo(1.62, CAB_BOTTOM);
  const g = new THREE.ExtrudeGeometry(s, {
    depth: CAB_HALF * 2,
    bevelEnabled: true,
    bevelThickness: 0.056,
    bevelSize: 0.056,
    bevelSegments: 3,
    curveSegments: 14,
  });
  g.translate(0, 0, -CAB_HALF);
  return g;
}

function sideWindowGeometry() {
  const s = new THREE.Shape();
  s.moveTo(1.84, 1.46);
  s.lineTo(1.84, 1.94);
  s.lineTo(2.4, 1.96);
  s.lineTo(2.62, 1.5);
  s.lineTo(1.84, 1.46);
  return new THREE.ExtrudeGeometry(s, { depth: 0.02, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.015, bevelSegments: 2 });
}

/** Half annulus around a wheel, extruded along z. */
function archGeometry(inner: number, outer: number, depth: number) {
  const s = new THREE.Shape();
  s.absarc(0, 0, outer, 0, Math.PI, false);
  s.absarc(0, 0, inner, Math.PI, 0, true);
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 24 });
  g.translate(0, 0, -depth / 2);
  return g;
}

/* ---------- wheels ---------- */

const TIRE_HALF = 0.115;
const tireGeo = (() => {
  const R = WHEEL_R;
  const pts = [
    [0.22, -TIRE_HALF], [R - 0.05, -TIRE_HALF], [R - 0.012, -TIRE_HALF + 0.03], [R, -TIRE_HALF + 0.07],
    [R, TIRE_HALF - 0.07], [R - 0.012, TIRE_HALF - 0.03], [R - 0.05, TIRE_HALF], [0.22, TIRE_HALF],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const g = new THREE.LatheGeometry(pts, 36);
  g.rotateX(Math.PI / 2);
  return g;
})();
const rimGeo = (() => {
  const pts = [[0, -0.085], [0.17, -0.085], [0.235, -0.105], [0.245, 0.105], [0.17, 0.085], [0, 0.085]].map(([x, y]) => new THREE.Vector2(x, y));
  const g = new THREE.LatheGeometry(pts, 28);
  g.rotateX(Math.PI / 2);
  return g;
})();

/** `side` is +1 or -1: the outward direction along z, where the lug nuts and hub cap are. */
function Wheel({ position, side, dual = false }: { position: V3; side: 1 | -1; dual?: boolean }) {
  const offsets = dual ? [-0.12, 0.12] : [0];
  const outer = (dual ? 0.12 : 0) + TIRE_HALF * 0.9;
  return (
    <group position={position}>
      {offsets.map((z) => (
        <group key={z} position={[0, 0, z]}>
          <mesh geometry={tireGeo} material={mat.rubber} />
          <mesh geometry={rimGeo} material={mat.rim} />
        </group>
      ))}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.12, Math.sin(a) * 0.12, side * outer]} rotation={[Math.PI / 2, 0, 0]} material={mat.chrome}>
            <cylinderGeometry args={[0.017, 0.017, 0.03, 8]} />
          </mesh>
        );
      })}
      <mesh position={[0, 0, side * (outer + 0.005)]} rotation={[Math.PI / 2, 0, 0]} material={mat.dark}>
        <cylinderGeometry args={[0.075, 0.075, 0.035, 18]} />
      </mesh>
      <mesh position={[0, 0, side * (outer + 0.02)]} rotation={[Math.PI / 2, 0, 0]} material={mat.emerald}>
        <cylinderGeometry args={[0.032, 0.032, 0.02, 14]} />
      </mesh>
    </group>
  );
}

/* ---------- cargo ---------- */

const liteBody = new THREE.LatheGeometry(bodyProfile(), 28);
const liteShoulder = new THREE.LatheGeometry(shoulderProfile(), 28);

/** Cheap cylinder for the ones already on the truck: two lathes and a valve, no label or handwheel. */
function LiteTank({ position }: { position: V3 }) {
  return (
    <group position={position} scale={TANK_S}>
      <mesh geometry={liteBody} material={mat.navy} />
      <mesh geometry={liteShoulder} material={mat.emerald} />
      <mesh position={[0, 1.95, 0]} material={mat.chrome}>
        <cylinderGeometry args={[0.15, 0.17, 0.4, 14]} />
      </mesh>
      <mesh position={[0, 2.3, 0]} rotation={[Math.PI / 2, 0, 0]} material={mat.emerald}>
        <torusGeometry args={[0.2, 0.03, 8, 20]} />
      </mesh>
    </group>
  );
}

function useDoorTexture() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 150;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#eef2f5";
    ctx.fillRect(0, 0, 512, 150);
    ctx.fillStyle = "#0f3d5e";
    ctx.textAlign = "center";
    ctx.font = "800 70px 'Segoe UI', Arial, sans-serif";
    ctx.fillText("CASPIAN GAZ", 256, 82);
    ctx.fillStyle = "#10b981";
    ctx.fillRect(86, 100, 340, 8);
    ctx.fillStyle = "#64748b";
    ctx.font = "600 28px 'Segoe UI', Arial, sans-serif";
    ctx.fillText("INDUSTRIAL & LABORATORY GASES", 256, 140);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

/** Posts and rails of a cylinder rack along one side of the bed. */
function Rack({ z }: { z: number }) {
  const top = DECK;
  return (
    <group>
      {[-1.75, -0.95, -0.15, 0.65, 1.4].map((x) => (
        <RB key={x} size={[0.05, 1.15, 0.05]} pos={[x, top + 0.575, z]} m={mat.steel} r={0.012} />
      ))}
      {[0.5, 1.02].map((h) => (
        <mesh key={h} position={[-0.15, top + h, z]} rotation={[0, 0, Math.PI / 2]} material={mat.steel}>
          <cylinderGeometry args={[0.018, 0.018, 3.2, 10]} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Cab-over flatbed truck facing +x. Origin is the centre of the load bed at ground level, deck top at `DECK`.
 * `wheels` is the parent of the wheel groups so the story can spin them with one ref.
 */
export function TruckModel({ wheels }: { wheels: React.RefObject<THREE.Group | null> }) {
  const door = useDoorTexture();
  const cab = useMemo(() => cabGeometry(), []);
  const band = useMemo(() => cabBandGeometry(), []);
  const windowGeo = useMemo(() => sideWindowGeometry(), []);
  const arch = useMemo(() => archGeometry(0.43, 0.52, 0.32), []);
  const minis: [number, number][] = [-1.12, -0.62, 0.62, 1.12].flatMap((x) => [
    [x, 0.38] as [number, number],
    [x, -0.38] as [number, number],
  ]);
  const sides: (1 | -1)[] = [1, -1];

  return (
    <group>
      {/* chassis */}
      {[0.4, -0.4].map((z) => (
        <RB key={z} size={[4.7, 0.17, 0.09]} pos={[0.55, 0.6, z]} m={mat.dark} r={0.012} />
      ))}
      {[-1.6, -0.2, 1.1, 2.0].map((x) => (
        <RB key={x} size={[0.08, 0.1, 0.9]} pos={[x, 0.6, 0]} m={mat.dark} r={0.012} />
      ))}
      {/* fuel tank and battery box between the axles */}
      <mesh position={[0.55, 0.5, 0.6]} rotation={[0, 0, Math.PI / 2]} material={mat.steel}>
        <cylinderGeometry args={[0.15, 0.15, 0.72, 24]} />
      </mesh>
      {[0.3, 0.8].map((x) => (
        <RB key={x} size={[0.03, 0.34, 0.04]} pos={[x, 0.5, 0.6]} m={mat.dark} r={0.008} />
      ))}
      <RB size={[0.5, 0.26, 0.32]} pos={[1.25, 0.5, -0.62]} m={mat.dark} r={0.02} />

      {/* deck */}
      <RB size={[3.55, 0.1, 1.9]} pos={[-0.15, DECK - 0.05, 0]} m={mat.steel} r={0.02} />
      {sides.map((s) => (
        <RB key={s} size={[3.55, 0.14, 0.05]} pos={[-0.15, DECK - 0.07, s * 0.95]} m={mat.dark} r={0.012} />
      ))}
      <RB size={[0.05, 0.14, 1.9]} pos={[-1.925, DECK - 0.07, 0]} m={mat.dark} r={0.012} />
      {sides.map((s) => (
        <Rack key={s} z={s * 0.9} />
      ))}
      {/* headache rack behind the cab */}
      <group>
        {[0.78, -0.78].map((z) => (
          <RB key={z} size={[0.06, 1.15, 0.06]} pos={[1.5, DECK + 0.575, z]} m={mat.steel} r={0.012} />
        ))}
        {[0.3, 0.7, 1.1].map((h) => (
          <RB key={h} size={[0.05, 0.05, 1.62]} pos={[1.5, DECK + h, 0]} m={mat.steel} r={0.012} />
        ))}
      </group>
      {/* tail beam and lights */}
      <RB size={[0.08, 0.14, 1.9]} pos={[-1.97, 0.66, 0]} m={mat.dark} r={0.02} />
      {sides.map((s) => (
        <RB key={s} size={[0.04, 0.12, 0.2]} pos={[-1.99, 0.8, s * 0.72]} m={mat.tail} r={0.015} />
      ))}
      <RB size={[0.02, 0.1, 0.3]} pos={[-2.01, 0.66, 0]} m={mat.plate} r={0.005} />

      {/* cab */}
      <mesh geometry={cab} material={mat.white} />
      <mesh geometry={band} material={mat.navy} />
      <RB size={[1.17, 0.035, 1.56]} pos={[2.205, 1.115, 0]} m={mat.emerald} r={0.01} />
      {sides.map((s) => (
        <group key={s}>
          <mesh geometry={windowGeo} material={mat.glass} position={[0, 0, s > 0 ? 0.745 : -0.765]} />
          {[1.78, 2.47].map((x) => (
            <RB key={x} size={[0.012, 0.62, 0.012]} pos={[x, 1.42, s * 0.765]} m={mat.dark} r={0.004} />
          ))}
          <RB size={[0.11, 0.025, 0.03]} pos={[2.34, 1.32, s * 0.775]} m={mat.chrome} r={0.01} />
          <RB size={[0.34, 0.035, 0.22]} pos={[2.0, 0.78, s * 0.8]} m={mat.steel} r={0.01} />
          {/* mirror on an arm */}
          <mesh position={[2.56, 1.68, s * 0.86]} rotation={[Math.PI / 2, 0, 0]} material={mat.dark}>
            <cylinderGeometry args={[0.012, 0.012, 0.2, 8]} />
          </mesh>
          <RB size={[0.05, 0.3, 0.16]} pos={[2.52, 1.62, s * 0.99]} m={mat.dark} r={0.02} />
          {/* branding, readable from both sides */}
          <mesh position={[2.12, 1.26, s * 0.776]} rotation={[0, s > 0 ? 0 : Math.PI, 0]}>
            <planeGeometry args={[0.78, 0.23]} />
            <meshStandardMaterial map={door} roughness={0.5} />
          </mesh>
          {/* wheel-arch trim around the front wheel */}
          <mesh geometry={arch} material={mat.navy} position={[2.05, WHEEL_R, s * 0.8]} />
        </group>
      ))}
      {/* windscreen */}
      <RB size={[0.025, 0.5, 1.34]} pos={[2.64, 1.69, 0]} rot={[0, 0, 0.44]} m={mat.glass} r={0.012} />
      {/* front face */}
      <RB size={[0.04, 0.3, 0.86]} pos={[2.835, 1.19, 0]} m={mat.dark} r={0.015} />
      {[1.1, 1.17, 1.24, 1.31].map((y) => (
        <RB key={y} size={[0.02, 0.016, 0.82]} pos={[2.862, y, 0]} m={mat.chrome} r={0.006} />
      ))}
      {sides.map((s) => (
        <RB key={s} size={[0.045, 0.13, 0.27]} pos={[2.84, 0.99, s * 0.56]} m={mat.headlight} r={0.03} />
      ))}
      <RB size={[0.2, 0.22, 1.62]} pos={[2.84, 0.66, 0]} m={mat.dark} r={0.04} />
      <RB size={[0.02, 0.09, 0.28]} pos={[2.945, 0.66, 0]} m={mat.plate} r={0.004} />
      {/* exhaust stack behind the cab */}
      <mesh position={[1.54, 1.55, 0.82]} material={mat.chrome}>
        <cylinderGeometry args={[0.04, 0.04, 1.4, 14]} />
      </mesh>
      <mesh position={[1.54, 2.27, 0.82]} material={mat.dark}>
        <cylinderGeometry args={[0.05, 0.04, 0.06, 14]} />
      </mesh>

      {/* wheels: single front axle, dual rear axle */}
      <group ref={wheels}>
        {sides.map((s) => (
          <Wheel key={`f${s}`} position={[2.05, WHEEL_R, s * 0.8]} side={s} />
        ))}
        {sides.map((s) => (
          <Wheel key={`r${s}`} position={[-0.95, WHEEL_R, s * 0.74]} side={s} dual />
        ))}
      </group>
      {/* mudflaps */}
      {sides.map((s) => (
        <RB key={s} size={[0.025, 0.32, 0.5]} pos={[-1.38, 0.3, s * 0.74]} m={mat.rubber} r={0.008} />
      ))}

      {/* cargo already on board; the delivered cylinder joins the centre */}
      {minis.map(([x, z]) => (
        <LiteTank key={`${x}-${z}`} position={[x, DECK + 2.2 * TANK_S, z]} />
      ))}
    </group>
  );
}
