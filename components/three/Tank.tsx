"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";

// Proportions follow a real industrial cylinder: tall and slim, domed shoulder, short neck.
const R = 0.46; // body radius
const BOTTOM = -2.2;
const SHOULDER = 1.0; // where the cylindrical part ends and the dome starts
const NECK_R = 0.14;
const NECK_Y = 1.72;

const v = (x: number, y: number) => new THREE.Vector2(x, y);

/** Flat dished base, rounded corner, straight wall. */
export function bodyProfile() {
  const corner = 0.14;
  const pts = [v(0, BOTTOM), v(R - corner, BOTTOM)];
  for (let i = 1; i <= 8; i++) {
    const a = -Math.PI / 2 + (i / 8) * (Math.PI / 2);
    pts.push(v(R - corner + Math.cos(a) * corner, BOTTOM + corner + Math.sin(a) * corner));
  }
  pts.push(v(R, SHOULDER));
  return pts;
}

/** Elliptical dome that narrows into the neck, then a short neck. */
export function shoulderProfile() {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= 18; i++) {
    const a = (i / 18) * (Math.PI / 2);
    pts.push(v(NECK_R + (R - NECK_R) * Math.cos(a), SHOULDER + (NECK_Y - SHOULDER) * Math.sin(a)));
  }
  pts.push(v(NECK_R, NECK_Y + 0.1));
  return pts;
}

/** Printed label wrapped around the body. The artwork repeats so it reads from both sides. */
function useLabelTexture() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 410;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#f3f6f8";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#10b981";
    ctx.fillRect(0, 0, canvas.width, 34);
    ctx.fillStyle = "#0f3d5e";
    ctx.fillRect(0, canvas.height - 18, canvas.width, 18);

    for (const cx of [256, 768]) {
      ctx.textAlign = "center";
      ctx.fillStyle = "#0f3d5e";
      ctx.font = "800 44px 'Segoe UI', Arial, sans-serif";
      ctx.fillText("CASPIAN GAZ", cx, 170);
      ctx.fillStyle = "#64748b";
      ctx.font = "600 24px 'Segoe UI', Arial, sans-serif";
      ctx.fillText("GROUP", cx, 214);
      // simple molecule mark
      ctx.strokeStyle = "#0f3d5e";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(cx - 34, 300);
      ctx.lineTo(cx + 26, 270);
      ctx.moveTo(cx - 34, 300);
      ctx.lineTo(cx + 26, 330);
      ctx.stroke();
      ctx.fillStyle = "#0f3d5e";
      ctx.beginPath();
      ctx.arc(cx - 34, 300, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#10b981";
      for (const y of [270, 330]) {
        ctx.beginPath();
        ctx.arc(cx + 30, y, 15, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }, []);

  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

const chrome = { color: "#d5dde3", metalness: 1, roughness: 0.2 } as const;

export function TankModel() {
  const body = useMemo(() => bodyProfile(), []);
  const shoulder = useMemo(() => shoulderProfile(), []);
  const label = useLabelTexture();

  return (
    <>
      {/* painted steel wall */}
      <mesh>
        <latheGeometry args={[body, 72]} />
        <meshPhysicalMaterial color="#0f3d5e" metalness={0.45} roughness={0.34} clearcoat={1} clearcoatRoughness={0.22} />
      </mesh>

      {/* color-coded shoulder */}
      <mesh>
        <latheGeometry args={[shoulder, 72]} />
        <meshPhysicalMaterial color="#10b981" metalness={0.3} roughness={0.32} clearcoat={1} clearcoatRoughness={0.2} />
      </mesh>
      <mesh position={[0, SHOULDER, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[R + 0.003, 0.01, 10, 72]} />
        <meshStandardMaterial color="#9fb0bd" metalness={0.9} roughness={0.3} />
      </mesh>

      {/* label */}
      <mesh position={[0, -0.55, 0]}>
        <cylinderGeometry args={[R + 0.004, R + 0.004, 1.15, 72, 1, true]} />
        <meshStandardMaterial map={label} roughness={0.55} metalness={0.05} side={THREE.FrontSide} />
      </mesh>

      {/* foot ring */}
      <mesh position={[0, BOTTOM - 0.02, 0]}>
        <cylinderGeometry args={[0.41, 0.44, 0.2, 56]} />
        <meshStandardMaterial color="#26343f" metalness={0.8} roughness={0.55} />
      </mesh>

      {/* neck collar */}
      <mesh position={[0, NECK_Y + 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.17, 0.034, 14, 40]} />
        <meshStandardMaterial color="#8fa1af" metalness={0.95} roughness={0.28} />
      </mesh>

      {/* valve assembly */}
      <group position={[0, NECK_Y + 0.1, 0]}>
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.13, 0.15, 0.34, 32]} />
          <meshStandardMaterial {...chrome} />
        </mesh>
        <mesh position={[0, 0.42, 0]}>
          <cylinderGeometry args={[0.105, 0.105, 0.1, 6]} />
          <meshStandardMaterial {...chrome} />
        </mesh>
        <mesh position={[0, 0.56, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.22, 16]} />
          <meshStandardMaterial {...chrome} />
        </mesh>
        {/* side outlet with connection nut */}
        <mesh position={[0.2, 0.24, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.048, 0.048, 0.26, 20]} />
          <meshStandardMaterial {...chrome} />
        </mesh>
        <mesh position={[0.32, 0.24, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.07, 0.07, 0.09, 6]} />
          <meshStandardMaterial {...chrome} />
        </mesh>
        {/* safety disc on the opposite side */}
        <mesh position={[-0.17, 0.24, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 0.12, 16]} />
          <meshStandardMaterial color="#9fb0bd" metalness={1} roughness={0.3} />
        </mesh>
        {/* handwheel */}
        <group position={[0, 0.7, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.2, 0.026, 14, 48]} />
            <meshStandardMaterial color="#10b981" roughness={0.45} metalness={0.1} />
          </mesh>
          {[0, Math.PI / 3, (2 * Math.PI) / 3].map((a) => (
            <mesh key={a} rotation={[0, a, 0]}>
              <boxGeometry args={[0.4, 0.024, 0.024]} />
              <meshStandardMaterial color="#10b981" roughness={0.45} metalness={0.1} />
            </mesh>
          ))}
          <mesh>
            <cylinderGeometry args={[0.05, 0.05, 0.06, 20]} />
            <meshStandardMaterial {...chrome} />
          </mesh>
        </group>
      </group>
    </>
  );
}
