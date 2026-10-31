export type GasKey = "O2" | "N2" | "Ar" | "CO2" | "He" | "H2";

type Atom = { p: [number, number, number]; r: number; tone: "a" | "b" };
type Molecule = { atoms: Atom[]; bonds: [number, number, 1 | 2 | 3][] };

export const molecules: Record<GasKey, Molecule> = {
  O2: {
    atoms: [
      { p: [-0.62, 0, 0], r: 0.52, tone: "a" },
      { p: [0.62, 0, 0], r: 0.52, tone: "a" },
    ],
    bonds: [[0, 1, 2]],
  },
  N2: {
    atoms: [
      { p: [-0.58, 0, 0], r: 0.5, tone: "b" },
      { p: [0.58, 0, 0], r: 0.5, tone: "b" },
    ],
    bonds: [[0, 1, 3]],
  },
  Ar: { atoms: [{ p: [0, 0, 0], r: 0.95, tone: "a" }], bonds: [] },
  CO2: {
    atoms: [
      { p: [0, 0, 0], r: 0.46, tone: "b" },
      { p: [-1.35, 0, 0], r: 0.54, tone: "a" },
      { p: [1.35, 0, 0], r: 0.54, tone: "a" },
    ],
    bonds: [
      [0, 1, 2],
      [0, 2, 2],
    ],
  },
  He: { atoms: [{ p: [0, 0, 0], r: 0.55, tone: "b" }], bonds: [] },
  H2: {
    atoms: [
      { p: [-0.45, 0, 0], r: 0.38, tone: "b" },
      { p: [0.45, 0, 0], r: 0.38, tone: "b" },
    ],
    bonds: [[0, 1, 1]],
  },
};

const bySlug: Record<string, GasKey> = {
  oxygen: "O2",
  nitrogen: "N2",
  argon: "Ar",
  "carbon-dioxide": "CO2",
  helium: "He",
  hydrogen: "H2",
  "liquid-nitrogen": "N2",
  "liquid-helium": "He",
  "liquid-oxygen": "O2",
};

export const gasForSlug = (slug: string): GasKey => bySlug[slug] ?? "O2";
