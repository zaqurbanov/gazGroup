"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { molecules, type GasKey } from "./gases";
import { TankModel } from "./Tank";
import { mulberry32, sceneStore, type Mode } from "./store";

const EMERALD = new THREE.Color("#10b981");
const WHITE = new THREE.Color("#ffffff");
const STEEL = new THREE.Color("#64748b");

const sectionMode: Record<string, Mode> = {
  hero: "molecule",
  about: "molecule",
  products: "molecule",
  stock: "tank",
  contact: "tank",
};

/** Where the group sits per mode on a wide screen; narrow screens move it behind the text. */
const layout: Record<Mode, { x: number; y: number; z: number; s: number }> = {
  molecule: { x: 3.1, y: 0, z: 0, s: 1.15 },
  tank: { x: 3.2, y: -0.15, z: 0, s: 0.95 },
  cloud: { x: 0, y: 0, z: -2, s: 1 },
};

function Particles({ count, gas }: { count: number; gas: GasKey }) {
  const geometry = useRef<THREE.BufferGeometry>(null);

  const base = useMemo(() => {
    const rand = mulberry32(20260101);
    const pos = new Float32Array(count * 3);
    const cloud = new Float32Array(count * 3);
    const color = new Float32Array(count * 3);
    const seed = new Float32Array(count * 3);
    const tmp = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const dir = new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize();
      const dist = 2.5 + rand() * 6;
      cloud[i * 3] = dir.x * dist * 1.4;
      cloud[i * 3 + 1] = dir.y * dist;
      cloud[i * 3 + 2] = dir.z * dist * 0.6;
      pos[i * 3] = cloud[i * 3];
      pos[i * 3 + 1] = cloud[i * 3 + 1];
      pos[i * 3 + 2] = cloud[i * 3 + 2];

      const r = rand();
      tmp.copy(r < 0.55 ? EMERALD : r < 0.85 ? WHITE : STEEL);
      color[i * 3] = tmp.r;
      color[i * 3 + 1] = tmp.g;
      color[i * 3 + 2] = tmp.b;
      seed[i * 3] = 0.35 + rand() * 0.65;
      seed[i * 3 + 1] = rand() * Math.PI * 2;
      seed[i * 3 + 2] = rand();
    }
    return { pos, cloud, color, seed };
  }, [count]);

  const moleculeTargets = useMemo(() => {
    const rand = mulberry32(777);
    const { atoms } = molecules[gas];
    const weights = atoms.map((a) => a.r * a.r);
    const total = weights.reduce((a, b) => a + b, 0);
    const out = new Float32Array(count * 3);
    const v = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
      let pick = rand() * total;
      let index = 0;
      while (index < atoms.length - 1 && pick > weights[index]) pick -= weights[index++];
      const atom = atoms[index];
      v.set(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize();
      const shell = atom.r * (1.12 + rand() * 0.35);
      out[i * 3] = atom.p[0] + v.x * shell;
      out[i * 3 + 1] = atom.p[1] + v.y * shell;
      out[i * 3 + 2] = atom.p[2] + v.z * shell;
    }
    return out;
  }, [gas, count]);

  useFrame((state, delta) => {
    const geo = geometry.current;
    if (!geo) return;
    const attr = geo.getAttribute("position") as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const { mode, fill } = sceneStore;
    const t = state.clock.elapsedTime;
    const k = 1 - Math.exp(-delta * 2.6);
    // Once settled in tank mode, particles follow the moving stream exactly instead of chasing it.
    sceneStore.flow = THREE.MathUtils.damp(sceneStore.flow, mode === "tank" ? 1 : 0, 0.9, delta);
    const direct = sceneStore.flow;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const s = base.seed[i3];
      const phase = base.seed[i3 + 1];
      let tx: number, ty: number, tz: number;

      if (mode === "molecule") {
        tx = moleculeTargets[i3] + Math.sin(t * 1.2 + phase) * 0.05;
        ty = moleculeTargets[i3 + 1] + Math.cos(t * 1.1 + phase) * 0.05;
        tz = moleculeTargets[i3 + 2];
      } else if (mode === "tank") {
        const u = base.seed[i3 + 2];
        if (u < fill) {
          // Gas spirals around the cylinder and is drawn into the valve. Fill sets how many are active.
          const ph = (t * (0.06 + s * 0.1) + u * 11.3) % 1;
          const e = ph * ph * (3 - 2 * ph);
          // Hugs the wall (body radius is 0.46), then tightens toward the valve once above the shoulder.
          const k2 = Math.min(1, Math.max(0, (e - 0.7) / 0.3));
          const radius = 0.62 - 0.42 * (k2 * k2 * (3 - 2 * k2));
          const angle = phase + ph * 10 + t * 0.2;
          tx = Math.cos(angle) * radius;
          tz = Math.sin(angle) * radius;
          ty = -1.9 + e * 4.1;
        } else {
          // Parked inside the opaque body, hidden by depth testing.
          tx = 0;
          ty = 0;
          tz = 0;
        }
      } else {
        tx = base.cloud[i3] + Math.sin(t * 0.3 + phase) * 0.4;
        ty = base.cloud[i3 + 1] + Math.cos(t * 0.25 + phase) * 0.4;
        tz = base.cloud[i3 + 2];
      }

      const kk = k * s + (1 - k * s) * direct;
      arr[i3] += (tx - arr[i3]) * kk;
      arr[i3 + 1] += (ty - arr[i3 + 1]) * kk;
      arr[i3 + 2] += (tz - arr[i3 + 2]) * kk;
    }
    attr.needsUpdate = true;
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry ref={geometry}>
        <bufferAttribute attach="attributes-position" args={[base.pos, 3]} />
        <bufferAttribute attach="attributes-color" args={[base.color, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.048}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Bond({ a, b, offset, radius = 0.06 }: { a: THREE.Vector3; b: THREE.Vector3; offset: number; radius?: number }) {
  const { position, quaternion, length } = useMemo(() => {
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
    mid.y += offset;
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    return { position: mid, quaternion: q, length: len };
  }, [a, b, offset]);

  return (
    <mesh position={position} quaternion={quaternion}>
      <cylinderGeometry args={[radius, radius, length, 12]} />
      <meshStandardMaterial color="#ffffff" transparent opacity={0.7} roughness={0.4} />
    </mesh>
  );
}

function MoleculeModel({ gas }: { gas: GasKey }) {
  const { atoms, bonds } = molecules[gas];
  return (
    <>
      {atoms.map((atom, i) => (
        <mesh key={i} position={atom.p}>
          <sphereGeometry args={[atom.r, 40, 40]} />
          <meshStandardMaterial
            color={atom.tone === "a" ? "#10b981" : "#ffffff"}
            emissive={atom.tone === "a" ? "#10b981" : "#64748b"}
            emissiveIntensity={0.22}
            roughness={0.32}
            metalness={0.12}
          />
        </mesh>
      ))}
      {bonds.map(([i, j, order], n) => {
        const a = new THREE.Vector3(...atoms[i].p);
        const b = new THREE.Vector3(...atoms[j].p);
        const offsets = order === 1 ? [0] : order === 2 ? [-0.1, 0.1] : [-0.16, 0, 0.16];
        return offsets.map((off, m) => <Bond key={`${n}-${m}`} a={a} b={b} offset={off} />);
      })}
    </>
  );
}

function World({ count, gas }: { count: number; gas: GasKey }) {
  const group = useRef<THREE.Group>(null);
  const molecule = useRef<THREE.Group>(null);
  const tank = useRef<THREE.Group>(null);
  const glow = useRef<THREE.PointLight>(null);
  const pop = useRef(0);

  useEffect(() => {
    pop.current = 0;
  }, [gas]);

  useFrame((state, delta) => {
    const s = sceneStore;
    const cfg = layout[s.mode];
    const g = group.current;
    if (!g) return;

    // Placement follows the live viewport. World units visible at z = 0 depend on the camera and aspect ratio.
    const camera = state.camera as THREE.PerspectiveCamera;
    const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    const halfW = halfH * (state.size.width / state.size.height);
    const phone = state.size.width < 768;
    // Rough half-width of what is drawn, used to keep it inside the screen.
    const extent = s.mode === "molecule" ? 2.1 : s.mode === "tank" ? 0.75 : 0;

    const targetX = phone ? halfW * 0.4 : Math.min(cfg.x, halfW * 0.62);
    const targetY = phone ? halfH * 0.6 : cfg.y;
    let targetS = cfg.s * (phone ? 0.5 : 1);
    if (extent > 0) targetS = Math.min(targetS, Math.max(0.25, (halfW - Math.abs(targetX) - 0.2) / extent));
    // A tall cylinder must also fit the screen height.
    if (s.mode === "tank") targetS = Math.min(targetS, (halfH * 2 * (phone ? 0.42 : 0.82)) / 4.8);

    g.position.x = THREE.MathUtils.damp(g.position.x, targetX, 2.4, delta);
    g.position.y = THREE.MathUtils.damp(g.position.y, targetY, 2.4, delta);
    g.position.z = THREE.MathUtils.damp(g.position.z, cfg.z, 2.4, delta);
    const sc = THREE.MathUtils.damp(g.scale.x, targetS, 2.4, delta);
    g.scale.setScalar(sc);

    g.rotation.y += delta * (s.mode === "tank" ? 0.35 : 0.18);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, s.py * 0.25, 3, delta);
    g.rotation.z = THREE.MathUtils.damp(g.rotation.z, -s.px * 0.12, 3, delta);

    pop.current = Math.min(1, pop.current + delta * 2.2);
    const eased = 1 - Math.pow(1 - pop.current, 3);
    if (molecule.current) {
      const v = s.mode === "molecule" ? 1 : 0;
      const m = THREE.MathUtils.damp(molecule.current.scale.x, v * eased || 0.0001, 4, delta);
      molecule.current.scale.setScalar(Math.max(m, 0.0001));
    }
    if (tank.current) {
      const v = s.mode === "tank" ? 1 : 0;
      tank.current.scale.setScalar(Math.max(THREE.MathUtils.damp(tank.current.scale.x, v, 4, delta), 0.0001));
    }
    if (glow.current) glow.current.intensity = THREE.MathUtils.damp(glow.current.intensity, s.mode === "tank" ? 9 * s.fill : 0, 3, delta);

    const targetFill = s.mode === "tank" ? 1 : 0.12;
    s.fill = THREE.MathUtils.damp(s.fill, targetFill, s.mode === "tank" ? 0.6 : 1.5, delta);
  });

  return (
    <group ref={group}>
      <group ref={molecule}>
        <MoleculeModel gas={gas} />
      </group>
      <group ref={tank}>
        <TankModel />
        <pointLight ref={glow} color="#10b981" position={[0.9, 2.2, 1.4]} distance={6} intensity={0} />
      </group>
      <Particles count={count} gas={gas} />
    </group>
  );
}

export default function Scene() {
  const [gas, setGas] = useState<GasKey>("O2");
  const [active, setActive] = useState(true);
  const [narrow] = useState(() => window.innerWidth < 768);
  const count = narrow ? 520 : 1400;

  useEffect(() => {
    sceneStore.narrow = narrow;
    let currentSection = "hero";
    let visible = !document.hidden;
    const apply = () => {
      const mode = sectionMode[currentSection] ?? "cloud";
      sceneStore.mode = mode;
      setActive(visible && currentSection in sectionMode);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            currentSection = (entry.target as HTMLElement).dataset.scene ?? "hero";
            apply();
          }
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    document.querySelectorAll("[data-scene]").forEach((el) => observer.observe(el));

    const onMove = (e: PointerEvent) => {
      sceneStore.px = (e.clientX / window.innerWidth) * 2 - 1;
      sceneStore.py = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onOver = (e: PointerEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-gas]");
      if (el?.dataset.gas && el.dataset.gas in molecules) setGas(el.dataset.gas as GasKey);
    };
    const onVisibility = () => {
      visible = !document.hidden;
      apply();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [narrow]);

  return (
    <Canvas
      aria-hidden="true"
      camera={{ position: [0, 0, 9], fov: 45 }}
      dpr={narrow ? 1 : [1, 1.75]}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: !narrow, alpha: true, powerPreference: "high-performance" }}
      // Dimmed on phones so text stays readable where the scene sits behind it.
      style={{ pointerEvents: "none", opacity: narrow ? 0.55 : 1 }}
      onCreated={({ gl, scene }) => {
        // Procedural studio environment: gives metal and clearcoat real reflections without downloading an HDR.
        const pmrem = new THREE.PMREMGenerator(gl);
        scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
        scene.environmentIntensity = 0.85;
        pmrem.dispose();
      }}
    >
      <ambientLight intensity={0.25} />
      <directionalLight position={[4, 5, 6]} intensity={2} />
      <directionalLight position={[-5, 2, -3]} intensity={1.2} color="#9be7d0" />
      <pointLight position={[-4, -2, 4]} intensity={10} color="#10b981" />
      <World count={count} gas={gas} />
    </Canvas>
  );
}
