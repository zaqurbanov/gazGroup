"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { placementFor } from "./placement";
import { BACK_Z, DECK, GROUND, storyAt } from "./timeline";
import { mulberry32, sceneStore } from "./store";
import { TruckModel } from "./Truck";

const PERIOD = 28;
const DASH = 1.8;

const wrap = (v: number, m: number) => ((v % m) + m) % m;

function useShadowTexture() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 62);
    g.addColorStop(0, "rgba(0,0,0,0.75)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(canvas);
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

/** One repeating strip of buildings. Layout is deterministic and repeats every PERIOD units. */
function skylineBoxes(seed: number, minH: number, maxH: number) {
  const rand = mulberry32(seed);
  const items: { x: number; w: number; h: number }[] = [];
  let x = 0;
  while (x < PERIOD) {
    const w = 0.7 + rand() * 1.5;
    const h = minH + rand() * (maxH - minH);
    items.push({ x: x + w / 2, w, h });
    x += w + 0.15 + rand() * 0.6;
  }
  return items;
}

/** Tile of dark facade with a few lit windows. Used as an emissive map so lit windows glow. */
function useWindowTexture(seed: number) {
  const texture = useMemo(() => {
    const rand = mulberry32(seed);
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 192;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 128, 192);
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 4; col++) {
        const r = rand();
        if (r > 0.2) continue;
        ctx.fillStyle = r < 0.04 ? "#10b981" : "#b9cfdd";
        ctx.fillRect(col * 32 + 11, row * 32 + 9, 10, 14);
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [seed]);
  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

function Skyline({ seed, z, minH, maxH, color, alpha, parallax }: {
  seed: number;
  z: number;
  minH: number;
  maxH: number;
  color: string;
  alpha: number;
  parallax: number;
}) {
  const group = useRef<THREE.Group>(null);
  const windows = useWindowTexture(seed);
  const boxes = useMemo(() => skylineBoxes(seed, minH, maxH), [seed, minH, maxH]);
  const geometries = useMemo(
    () =>
      boxes.map((b) => {
        const g = new THREE.BoxGeometry(b.w, b.h, 0.8);
        // Keep the window size constant: one texture tile covers 1.2 x 1.8 world units.
        const uv = g.getAttribute("uv") as THREE.BufferAttribute;
        for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) * b.w) / 1.2, (uv.getY(i) * b.h) / 1.8);
        return g;
      }),
    [boxes],
  );
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.85,
        metalness: 0.2,
        emissive: "#ffffff",
        emissiveMap: windows,
        emissiveIntensity: 0.6,
        transparent: true,
        opacity: 0,
      }),
    [color, windows],
  );
  const materialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  useEffect(() => {
    materialRef.current = material;
    return () => {
      material.dispose();
      geometries.forEach((g) => g.dispose());
    };
  }, [material, geometries]);

  useFrame(() => {
    if (group.current) group.current.position.x = wrap(-sceneStore.camX * parallax, PERIOD);
    const m = materialRef.current;
    if (m) {
      m.opacity = alpha * sceneStore.fade;
      m.emissiveIntensity = 0.6 * sceneStore.fade;
    }
  });

  return (
    <group ref={group} position={[0, GROUND, z]}>
      {/* Only [-14, 14] plus the wrap offset (< PERIOD) is ever on screen, so three copies are enough. */}
      {[-1, 0, 1].flatMap((k) =>
        boxes.map((b, i) => (
          <mesh key={`${k}-${i}`} position={[k * PERIOD + b.x - PERIOD / 2, b.h / 2, 0]} geometry={geometries[i]} material={material} />
        )),
      )}
    </group>
  );
}

/**
 * Stage for the delivery story: road, skyline, a truck, contact shadows and a "secured" pulse.
 * Hidden unless the story is on screen. It reads `sceneStore.story` every frame, nothing re-renders.
 */
export function StoryStage() {
  const root = useRef<THREE.Group>(null);
  const stage = useRef<THREE.Group>(null);
  const truck = useRef<THREE.Group>(null);
  const wheels = useRef<THREE.Group>(null);
  const dashes = useRef<THREE.Group>(null);
  const roadMat = useRef<THREE.MeshStandardMaterial>(null);
  const lineMat = useRef<THREE.MeshBasicMaterial>(null);
  const lineMat2 = useRef<THREE.MeshBasicMaterial>(null);
  const truckShadow = useRef<THREE.MeshBasicMaterial>(null);
  const tankShadowMesh = useRef<THREE.Mesh>(null);
  const tankShadowMat = useRef<THREE.MeshBasicMaterial>(null);
  const pulseMesh = useRef<THREE.Mesh>(null);
  const pulseMat = useRef<THREE.MeshBasicMaterial>(null);
  const shadow = useShadowTexture();

  useFrame((state) => {
    const r = root.current;
    if (!r) return;
    const p = sceneStore.story;
    const on = p >= 0 && sceneStore.mode === "tank";
    r.visible = on;
    if (!on || !stage.current || !truck.current) return;

    const pl = placementFor("tank", state.camera as THREE.PerspectiveCamera, state.size);
    const f = storyAt(p, pl.U, { x: pl.x, y: pl.y, s: pl.s });

    stage.current.scale.setScalar(pl.U);
    truck.current.position.set(f.truckX - f.camX, GROUND, BACK_Z);
    for (const w of wheels.current?.children ?? []) w.rotation.z = f.wheelAngle;

    if (dashes.current) dashes.current.position.x = wrap(-f.camX, DASH);
    sceneStore.camX = f.camX;
    sceneStore.fade = f.fade;

    if (roadMat.current) roadMat.current.opacity = f.fade;
    if (lineMat.current) lineMat.current.opacity = 0.4 * f.fade;
    if (lineMat2.current) lineMat2.current.opacity = 0.4 * f.fade;
    if (truckShadow.current) truckShadow.current.opacity = 0.55 * f.fade;

    if (tankShadowMesh.current && tankShadowMat.current) {
      tankShadowMesh.current.position.set(f.tankShadow.x, GROUND + 0.012, f.tankShadow.z);
      tankShadowMat.current.opacity = f.tankShadow.opacity * 0.6;
    }
    if (pulseMesh.current && pulseMat.current) {
      pulseMesh.current.visible = f.pulse >= 0;
      pulseMesh.current.scale.setScalar(1 + Math.max(0, f.pulse) * 2.4);
      pulseMat.current.opacity = Math.max(0, 1 - f.pulse) * 0.9;
    }
  });

  return (
    <group ref={root} visible={false}>
      <group ref={stage}>
        {/* road */}
        <mesh position={[0, GROUND - 0.05, -0.5]}>
          <boxGeometry args={[90, 0.1, 5]} />
          <meshStandardMaterial ref={roadMat} color="#101c27" roughness={0.6} metalness={0.5} transparent opacity={0} />
        </mesh>
        {[2.0, -3.0].map((z) => (
          <mesh key={z} position={[0, GROUND + 0.012, z]}>
            <boxGeometry args={[90, 0.02, 0.05]} />
            <meshBasicMaterial ref={z > 0 ? lineMat : lineMat2} color="#9fb0bd" transparent opacity={0} />
          </mesh>
        ))}
        <group ref={dashes}>
          {Array.from({ length: 22 }, (_, i) => (
            <mesh key={i} position={[(i - 11) * DASH, GROUND + 0.014, -0.05]}>
              <boxGeometry args={[0.8, 0.02, 0.1]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.35} />
            </mesh>
          ))}
        </group>

        <Skyline seed={11} z={-8} minH={1.6} maxH={4.2} color="#0c2c47" alpha={0.7} parallax={0.2} />
        <Skyline seed={29} z={-5} minH={0.9} maxH={2.4} color="#0a2339" alpha={0.9} parallax={0.45} />

        {/* contact shadow for the cylinder while it stands on the ground */}
        <mesh ref={tankShadowMesh} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.1, 1.1]} />
          <meshBasicMaterial ref={tankShadowMat} map={shadow} transparent opacity={0} depthWrite={false} />
        </mesh>

        <group ref={truck}>
          <TruckModel wheels={wheels} />
          <mesh position={[0.5, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[6.2, 2.6]} />
            <meshBasicMaterial ref={truckShadow} map={shadow} transparent opacity={0} depthWrite={false} />
          </mesh>
          {/* confirms the cylinder is secured */}
          <mesh ref={pulseMesh} position={[0, DECK + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
            <ringGeometry args={[0.22, 0.27, 48]} />
            <meshBasicMaterial ref={pulseMat} color="#10b981" transparent opacity={0} depthWrite={false} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
